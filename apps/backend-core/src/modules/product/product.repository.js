/**
 * @fileoverview Repository xử lý các tương tác trực tiếp với cơ sở dữ liệu cho thực thể Sản phẩm (Product).
 * Bao gồm các hàm CRUD, tìm kiếm, tính toán rating trung bình, và xử lý lượt tải xuống.
 * @module product/repository
 */

const { prisma } = require("../../config/database");

/**
 * Đối tượng chứa các phương thức tương tác với bảng products và các bảng liên quan.
 * @namespace ProductRepository
 */
const ProductRepository = {
  /**
   * Lấy danh sách sản phẩm với các điều kiện tìm kiếm, phân trang và bộ lọc theo người dùng.
   * Đồng thời tính toán số sao đánh giá trung bình và số lượng đánh giá cho mỗi sản phẩm.
   * @async
   * @function findAll
   * @param {string} [search=""] - Từ khóa tìm kiếm theo tên sản phẩm.
   * @param {Object|null} [user=null] - Thông tin người dùng hiện tại (để lọc theo người tạo nếu là editor).
   * @param {number|string|null} [page=null] - Trang hiện tại để phân trang.
   * @param {number|string|null} [limit=null] - Số lượng bản ghi trên mỗi trang.
   * @returns {Promise<Array<Object>>} Trả về mảng các đối tượng sản phẩm kèm thông tin mở rộng.
   */
  async findAll(search = "", user = null, page = null, limit = null) {
    const where = { deleted_at: null };
    if (search) {
      where.name = { contains: search };
    }
    if (user && user.role_name === 'editor') {
      where.created_by = parseInt(user.id);
    }

    const queryParams = {
      where,
      include: {
        categories: true,
        users_products_created_byTousers: true,
        product_images: {
          orderBy: [ { is_primary: 'desc' }, { id: 'asc' } ],
          take: 1
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { created_at: 'desc' }
    };

    if (page && limit) {
      queryParams.skip = (parseInt(page) - 1) * parseInt(limit);
      queryParams.take = parseInt(limit);
    }

    const products = await prisma.products.findMany(queryParams);

    const productIds = products.map(p => p.id);
    let avgMap = {};
    if (productIds.length > 0) {
      const avgRatings = await prisma.reviews.groupBy({
        by: ['product_id'],
        where: { product_id: { in: productIds } },
        _avg: { rating: true }
      });
      for (const row of avgRatings) {
        avgMap[row.product_id] = parseFloat(row._avg.rating || 0).toFixed(1);
      }
    }

    return products.map(p => ({
      ...p,
      category_name: p.categories?.name,
      creator_name: p.users_products_created_byTousers?.full_name,
      creator_email: p.users_products_created_byTousers?.email,
      primary_image: p.product_images[0]?.image_url || null,
      average_rating: parseFloat(avgMap[p.id] || 0),
      review_count: p._count.reviews
    }));
  },

  /**
   * Lấy thông tin chi tiết một sản phẩm theo ID.
   * @async
   * @function findById
   * @param {number|string} id - ID của sản phẩm.
   * @returns {Promise<Object|null>} Trả về đối tượng sản phẩm hoặc null nếu không tìm thấy.
   */
  async findById(id) {
    const p = await prisma.products.findFirst({
      where: { id: parseInt(id), deleted_at: null },
      include: {
        categories: true,
        users_products_created_byTousers: true,
        product_images: {
          orderBy: [ { is_primary: 'desc' }, { id: 'asc' } ]
        },
        _count: {
          select: { reviews: true }
        }
      }
    });

    if (!p) return null;

    const avg = await prisma.reviews.aggregate({
      where: { product_id: parseInt(id) },
      _avg: { rating: true }
    });

    return {
      ...p,
      category_name: p.categories?.name,
      creator_name: p.users_products_created_byTousers?.full_name,
      average_rating: parseFloat(avg._avg.rating || 0).toFixed(1),
      review_count: p._count.reviews,
      images: p.product_images,
      primary_image: p.product_images[0]?.image_url || null
    };
  },

  /**
   * Tìm kiếm sản phẩm theo tên chính xác (dùng để kiểm tra trùng lặp).
   * @async
   * @function findByName
   * @param {string} name - Tên sản phẩm cần tìm.
   * @returns {Promise<Object|null>} Trả về sản phẩm nếu tìm thấy, ngược lại null.
   */
  async findByName(name) {
    return await prisma.products.findFirst({
      where: { name, deleted_at: null }
    });
  },

  /**
   * Lấy danh sách các đánh giá của một sản phẩm cụ thể.
   * @async
   * @function getReviews
   * @param {number|string} productId - ID của sản phẩm.
   * @returns {Promise<Array<Object>>} Trả về mảng các đánh giá kèm thông tin người dùng.
   */
  async getReviews(productId) {
    const reviews = await prisma.reviews.findMany({
      where: { product_id: parseInt(productId) },
      include: { users: true },
      orderBy: { created_at: 'desc' }
    });

    return reviews.map(r => ({
      ...r,
      user_name: r.users?.full_name || r.users?.username || r.users?.email
    }));
  },

  /**
   * Kiểm tra xem người dùng đã mua sản phẩm và có quyền truy cập hay chưa.
   * @async
   * @function hasPurchased
   * @param {number|string} userId - ID của người dùng.
   * @param {number|string} productId - ID của sản phẩm.
   * @returns {Promise<boolean>} Trả về true nếu đã mua và đang có quyền (active), ngược lại false.
   */
  async hasPurchased(userId, productId) {
    const owned = await prisma.owned_products.findFirst({
      where: {
        user_id: parseInt(userId),
        product_id: parseInt(productId),
        status: 'active' // ensuring we check for active access
      }
    });
    return !!owned;
  },

  /**
   * Tạo mới hoặc cập nhật đánh giá (review) cho một sản phẩm từ một người dùng.
   * @async
   * @function upsertReview
   * @param {number|string} userId - ID của người dùng đánh giá.
   * @param {number|string} productId - ID của sản phẩm được đánh giá.
   * @param {number|string} rating - Số sao đánh giá.
   * @param {string} comment - Nội dung đánh giá.
   * @returns {Promise<Object>} Trả về đối tượng đánh giá sau khi tạo hoặc cập nhật.
   */
  async upsertReview(userId, productId, rating, comment) {
    const result = await prisma.reviews.upsert({
      where: {
        user_id_product_id: {
          user_id: parseInt(userId),
          product_id: parseInt(productId)
        }
      },
      update: {
        rating: parseInt(rating),
        comment: comment || "",
        created_at: new Date()
      },
      create: {
        user_id: parseInt(userId),
        product_id: parseInt(productId),
        rating: parseInt(rating),
        comment: comment || ""
      },
      include: { users: true }
    });

    return {
      ...result,
      user_name: result.users?.full_name || result.users?.username || result.users?.email
    };
  },

  /**
   * Tạo mới một sản phẩm vào cơ sở dữ liệu.
   * Xử lý cả chi tiết giá vốn (cost_details) và ảnh của sản phẩm thông qua transaction.
   * @async
   * @function create
   * @param {Object} productData - Dữ liệu của sản phẩm cần tạo.
   * @returns {Promise<Object>} Trả về thông tin sản phẩm vừa được tạo.
   */
  async create(productData) {
    const { 
      sku, name, description, price, cost_price, stock = 0, 
      category_id, type = 'ebook', download_url, 
      status = 'draft', created_by = null, images = [], cost_details = null,
      file_size, version
    } = productData;
    
    let finalCostPrice = cost_price || 0;
    let costDetailsStr = null;
    if (cost_details) {
      const details = Array.isArray(cost_details) ? cost_details : (typeof cost_details === 'string' ? JSON.parse(cost_details) : []);
      costDetailsStr = JSON.stringify(details);
      finalCostPrice = details.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    }
    
    return await prisma.$transaction(async (tx) => {
      const p = await tx.products.create({
        data: {
          sku: sku || null,
          name,
          description: description || '',
          price: price || 0,
          cost_price: finalCostPrice,
          cost_details: costDetailsStr,
          category_id: category_id ? parseInt(category_id) : null,
          type,
          download_url: download_url || '',
          status,
          created_by: created_by ? parseInt(created_by) : null,
          file_size: file_size || null,
          version: version || null
        }
      });
      
      const imgList = Array.isArray(images) ? images : (images ? [images] : []);
      if (imgList.length > 0) {
        await tx.product_images.createMany({
          data: imgList.map((url, index) => ({
            product_id: p.id,
            image_url: url,
            is_primary: index === 0
          }))
        });
      }
      
      return { id: p.id, ...productData, cost_price: finalCostPrice, cost_details: costDetailsStr };
    });
  },

  /**
   * Cập nhật thông tin của một sản phẩm.
   * Cập nhật thông tin cơ bản và thay thế hình ảnh hiện tại nếu có cung cấp mảng hình ảnh mới.
   * @async
   * @function update
   * @param {number|string} id - ID của sản phẩm cần cập nhật.
   * @param {Object} productData - Dữ liệu cập nhật mới cho sản phẩm.
   * @returns {Promise<Object>} Trả về thông tin sản phẩm sau khi cập nhật.
   */
  async update(id, productData) {
    const { 
      sku, name, description, price, cost_price, stock = 0, 
      category_id, type, download_url, 
      status, feedback = null, approved_by = null, approved_at = null, images = undefined, cost_details = undefined,
      file_size, version
    } = productData;
    
    let finalCostPrice = cost_price || 0;
    let costDetailsStr = undefined;
    
    const updateData = {
      sku: sku || null,
      name,
      description: description || '',
      price: price || 0,
      category_id: category_id ? parseInt(category_id) : null,
      type: type || 'ebook',
      download_url: download_url || '',
      status: status || 'draft',
      feedback,
      approved_by: approved_by ? parseInt(approved_by) : null,
      approved_at,
      file_size: file_size || null,
      version: version || null
    };

    if (cost_details !== undefined) {
      const details = Array.isArray(cost_details) ? cost_details : (typeof cost_details === 'string' ? JSON.parse(cost_details) : []);
      costDetailsStr = JSON.stringify(details);
      finalCostPrice = details.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      updateData.cost_price = finalCostPrice;
      updateData.cost_details = costDetailsStr;
    } else if (cost_price !== undefined) {
      updateData.cost_price = finalCostPrice;
    }
    
    return await prisma.$transaction(async (tx) => {
      await tx.products.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      if (images !== undefined) {
        const imgList = Array.isArray(images) ? images : (images ? [images] : []);
        if (imgList.length > 0) {
          await tx.product_images.deleteMany({ where: { product_id: parseInt(id) } });
          await tx.product_images.createMany({
            data: imgList.map((url, index) => ({
              product_id: parseInt(id),
              image_url: url,
              is_primary: index === 0
            }))
          });
        } else if (imgList.length === 0) {
          // If explicitly given empty array, delete all images
          await tx.product_images.deleteMany({ where: { product_id: parseInt(id) } });
        }
      }
      
      return { id: parseInt(id), ...productData, cost_price: finalCostPrice, cost_details: costDetailsStr };
    });
  },

  /**
   * Xóa mềm (soft delete) một sản phẩm.
   * Gán giá trị deleted_at bằng thời gian hiện tại.
   * @async
   * @function delete
   * @param {number|string} id - ID của sản phẩm cần xóa.
   * @returns {Promise<boolean>} Trả về true nếu thành công.
   */
  async delete(id) {
    await prisma.products.update({
      where: { id: parseInt(id) },
      data: { deleted_at: new Date() }
    });
    return true;
  },

  /**
   * Tìm kiếm các sản phẩm đã bị xóa mềm (nằm trong thùng rác).
   * @async
   * @function findTrash
   * @param {string} [search=""] - Tên sản phẩm cần tìm.
   * @param {Object|null} [user=null] - Người dùng hiện tại để phân quyền hiển thị (editor chỉ thấy của mình).
   * @returns {Promise<Array<Object>>} Trả về danh sách sản phẩm đã bị xóa mềm.
   */
  async findTrash(search = "", user = null) {
    const where = { deleted_at: { not: null } };
    if (search) {
      where.name = { contains: search };
    }
    if (user && user.role_name === 'editor') {
      where.created_by = parseInt(user.id);
    }

    const products = await prisma.products.findMany({
      where,
      include: {
        categories: true,
        users_products_created_byTousers: true,
        product_images: {
          orderBy: [ { is_primary: 'desc' }, { id: 'asc' } ],
          take: 1
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { deleted_at: 'desc' }
    });

    const productIds = products.map(p => p.id);
    let avgMap = {};
    if (productIds.length > 0) {
      const avgRatings = await prisma.reviews.groupBy({
        by: ['product_id'],
        where: { product_id: { in: productIds } },
        _avg: { rating: true }
      });
      for (const row of avgRatings) {
        avgMap[row.product_id] = parseFloat(row._avg.rating || 0).toFixed(1);
      }
    }

    return products.map(p => ({
      ...p,
      category_name: p.categories?.name,
      creator_name: p.users_products_created_byTousers?.full_name,
      creator_email: p.users_products_created_byTousers?.email,
      primary_image: p.product_images[0]?.image_url || null,
      average_rating: parseFloat(avgMap[p.id] || 0),
      review_count: p._count.reviews
    }));
  },

  /**
   * Khôi phục lại sản phẩm đã bị xóa mềm.
   * Gán giá trị deleted_at thành null.
   * @async
   * @function restore
   * @param {number|string} id - ID của sản phẩm.
   * @returns {Promise<boolean>} Trả về true nếu thành công.
   */
  async restore(id) {
    await prisma.products.update({
      where: { id: parseInt(id) },
      data: { deleted_at: null }
    });
    return true;
  },

  /**
   * Lấy danh sách các đánh giá mới nhất trên hệ thống.
   * @async
   * @function getLatestReviews
   * @param {number|string} [limit=6] - Số lượng đánh giá tối đa muốn lấy.
   * @returns {Promise<Array<Object>>} Trả về danh sách đánh giá mới nhất.
   */
  async getLatestReviews(limit = 6) {
    const reviews = await prisma.reviews.findMany({
      take: parseInt(limit),
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          include: { roles: true }
        },
        products: true
      }
    });

    return reviews.map(r => ({
      ...r,
      user_name: r.users?.full_name || r.users?.username || r.users?.email,
      user_role: r.users?.roles?.name || 'Customer',
      product_name: r.products?.name
    }));
  },

  /**
   * Xử lý logic cấp quyền tải xuống sản phẩm cho người dùng.
   * Kiểm tra quyền, giới hạn số lượt tải, ghi nhận log và trả về URL tải.
   * @async
   * @function processDownload
   * @param {number|string} productId - ID sản phẩm cần tải.
   * @param {number|string} userId - ID người dùng thực hiện tải xuống.
   * @param {string|null} [ipAddress=null] - Địa chỉ IP của người dùng.
   * @param {string|null} [userAgent=null] - Thông tin trình duyệt (User-Agent).
   * @throws {Error} Quăng lỗi nếu người dùng không đủ điều kiện tải xuống (chưa thanh toán, hết lượt, v.v.).
   * @returns {Promise<string>} Trả về URL để tải sản phẩm xuống.
   */
  async processDownload(productId, userId, ipAddress = null, userAgent = null) {
    const owned = await prisma.owned_products.findFirst({
      where: {
        user_id: parseInt(userId),
        product_id: parseInt(productId)
      },
      include: {
        products: true,
        orders: true
      }
    });

    if (!owned) {
      throw new Error("Bạn chưa mua sản phẩm này.");
    }

    if (owned.status !== 'active') {
      throw new Error("Quyền truy cập sản phẩm của bạn đã bị thu hồi hoặc chưa được kích hoạt.");
    }

    if (owned.orders?.status !== 'paid') {
      throw new Error("Đơn hàng của bạn chưa được thanh toán.");
    }

    if (owned.access_expires_at && new Date(owned.access_expires_at) < new Date()) {
      throw new Error("Quyền truy cập sản phẩm của bạn đã hết hạn.");
    }

    if (owned.download_limit !== null) {
      if (owned.download_limit <= 0) {
        throw new Error("Bạn đã hết lượt tải xuống cho sản phẩm này.");
      }
      
      await prisma.owned_products.update({
        where: { id: owned.id },
        data: { download_limit: { decrement: 1 } }
      });
    }

    await prisma.downloads.create({
      data: {
        user_id: parseInt(userId),
        product_id: parseInt(productId),
        order_id: owned.order_id,
        ip_address: ipAddress,
        user_agent: userAgent
      }
    });

    return owned.products?.download_url;
  }
};

module.exports = ProductRepository;
