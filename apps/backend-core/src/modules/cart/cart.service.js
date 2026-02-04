/**
 * @fileoverview Module Service chứa các nghiệp vụ logic (Business Logic) liên quan đến giỏ hàng (Cart).
 * Kết nối trực tiếp với Database thông qua Prisma ORM để truy xuất, thêm mới, xóa và đồng bộ dữ liệu giỏ hàng.
 */

const { prisma } = require('../../config/database');
const AppError = require('../../utils/app-error');

/**
 * Dịch vụ cung cấp các phương thức thao tác dữ liệu với giỏ hàng.
 * @namespace CartService
 */
const CartService = {
  /**
   * Lấy danh sách sản phẩm trong giỏ hàng của một người dùng.
   * @async
   * @function getCart
   * @param {string|number} userId - ID của người dùng.
   * @returns {Promise<number[]>} Một mảng chứa ID các sản phẩm có trong giỏ hàng của người dùng.
   */
  async getCart(userId) {
    const items = await prisma.cart_items.findMany({
      where: { user_id: parseInt(userId) },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            primary_image: true,
            type: true,
            is_active: true,
            status: true,
            product_images: {
              select: { image_url: true },
              take: 1
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    // Map to just product IDs to align with localStorage cart format initially, 
    // or return full objects for the cart page.
    return items.map(item => item.product_id);
  },

  /**
   * Thêm một sản phẩm vào giỏ hàng của người dùng.
   * @async
   * @function addToCart
   * @param {string|number} userId - ID của người dùng.
   * @param {string|number} productId - ID của sản phẩm cần thêm.
   * @returns {Promise<Object>} Trả về đối tượng bản ghi giỏ hàng (cart_item) đã thêm, hoặc bản ghi hiện tại nếu sản phẩm đã tồn tại trong giỏ.
   * @throws {AppError} Quăng lỗi HTTP 400 nếu thiếu productId.
   */
  async addToCart(userId, productId) {
    if (!productId) throw new AppError("Thiếu product_id", 400);

    const exists = await prisma.cart_items.findUnique({
      where: {
        user_id_product_id: {
          user_id: parseInt(userId),
          product_id: parseInt(productId)
        }
      }
    });

    if (exists) return exists;

    return await prisma.cart_items.create({
      data: {
        user_id: parseInt(userId),
        product_id: parseInt(productId)
      }
    });
  },

  /**
   * Đồng bộ dữ liệu giỏ hàng (thường là từ local storage) lên hệ thống.
   * Xử lý xác thực các ID sản phẩm hợp lệ và thêm những sản phẩm mới vào DB.
   * @async
   * @function syncCart
   * @param {string|number} userId - ID của người dùng.
   * @param {Array<string|number>} cartIds - Mảng các ID sản phẩm cần đồng bộ.
   * @returns {Promise<number[]>} Trả về danh sách cập nhật của các ID sản phẩm hiện có trong giỏ hàng.
   * @throws {AppError} Quăng lỗi HTTP 400 nếu dữ liệu cartIds không phải mảng hoặc không hợp lệ.
   */
  async syncCart(userId, cartIds) {
    if (!cartIds || !Array.isArray(cartIds)) {
      throw new AppError("Dữ liệu cart không hợp lệ", 400);
    }

    const validIds = cartIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (validIds.length > 0) {
      // Filter valid active products
      const products = await prisma.products.findMany({
        where: { id: { in: validIds }, is_active: true, deleted_at: null },
        select: { id: true }
      });
      
      const validProductIds = products.map(p => p.id);

      // Get existing cart items for this user
      const existing = await prisma.cart_items.findMany({
        where: { user_id: parseInt(userId), product_id: { in: validProductIds } },
        select: { product_id: true }
      });

      const existingIds = existing.map(e => e.product_id);

      // Determine new items to insert
      const toInsert = validProductIds.filter(id => !existingIds.includes(id));

      if (toInsert.length > 0) {
        await prisma.cart_items.createMany({
          data: toInsert.map(id => ({
            user_id: parseInt(userId),
            product_id: id
          }))
        });
      }
    }

    return this.getCart(userId);
  },

  /**
   * Xóa một sản phẩm cụ thể khỏi giỏ hàng của người dùng.
   * @async
   * @function removeFromCart
   * @param {string|number} userId - ID của người dùng.
   * @param {string|number} productId - ID của sản phẩm cần xóa.
   * @returns {Promise<void>} Hoàn thành quá trình xóa.
   * @throws {AppError} Quăng lỗi HTTP 400 nếu thiếu productId.
   */
  async removeFromCart(userId, productId) {
    if (!productId) throw new AppError("Thiếu product_id", 400);
    
    await prisma.cart_items.deleteMany({
      where: {
        user_id: parseInt(userId),
        product_id: parseInt(productId)
      }
    });
  },

  /**
   * Xóa toàn bộ sản phẩm khỏi giỏ hàng của một người dùng.
   * @async
   * @function clearCart
   * @param {string|number} userId - ID của người dùng cần làm sạch giỏ hàng.
   * @returns {Promise<void>} Hoàn thành quá trình dọn dẹp giỏ hàng.
   */
  async clearCart(userId) {
    await prisma.cart_items.deleteMany({
      where: { user_id: parseInt(userId) }
    });
  }
};

module.exports = CartService;
