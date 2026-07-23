const CategoryRepository = require('../src/modules/category/category.repository');
const CategoryService = require('../src/modules/category/category.service');
const AppError = require('../src/utils/app-error');

jest.mock('../src/modules/category/category.repository', () => ({
  findAll: jest.fn(),
  findAllWithRelations: jest.fn(),
  findByName: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findTrash: jest.fn(),
  restore: jest.fn(),
}));

describe('CategoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('builds nested category tree correctly', async () => {
    CategoryRepository.findAllWithRelations.mockResolvedValue([
      { id: 1, name: 'Electronics', parent_id: null, status: 'active' },
      { id: 2, name: 'Phones', parent_id: 1, status: 'active' },
      { id: 3, name: 'Laptops', parent_id: 1, status: 'active' },
      { id: 4, name: 'Android', parent_id: 2, status: 'active' }
    ]);

    const tree = await CategoryService.getCategoryTree();

    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe('Electronics');
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children.find(child => child.name === 'Phones').children[0].name).toBe('Android');
  });

  test('createCategory accepts status and parent_id', async () => {
    const data = { name: 'Accessories', status: 'inactive', parent_id: 1 };
    CategoryRepository.findByName.mockResolvedValue(null);
    CategoryRepository.findById.mockResolvedValue({ id: 1, name: 'Electronics' });
    CategoryRepository.create.mockResolvedValue({ id: 5, name: 'Accessories', status: 'inactive', parent_id: 1 });

    const category = await CategoryService.createCategory(data);

    expect(CategoryRepository.create).toHaveBeenCalledWith({
      name: 'Accessories',
      status: 'inactive',
      parent_id: 1
    });
    expect(category).toEqual({ id: 5, name: 'Accessories', status: 'inactive', parent_id: 1 });
  });

  test('updateCategory prevents circular parent assignment', async () => {
    CategoryRepository.findById.mockImplementation(id => {
      if (Number(id) === 1) return Promise.resolve({ id: 1, name: 'Electronics' });
      if (Number(id) === 2) return Promise.resolve({ id: 2, name: 'Phones', parent_id: 1 });
      return Promise.resolve(null);
    });
    CategoryRepository.findAllWithRelations.mockResolvedValue([
      { id: 1, parent_id: null },
      { id: 2, parent_id: 1 },
      { id: 3, parent_id: 2 }
    ]);

    await expect(CategoryService.updateCategory(1, { parent_id: 3 })).rejects.toThrow(AppError);
  });
});
