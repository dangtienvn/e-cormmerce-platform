import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export const getCategories = async () => {
    return await prisma.category.findMany({
        orderBy: { position: 'asc' }
    });
};

export const getCategoryTree = async () => {
    const categories = await prisma.category.findMany({
        orderBy: { position: 'asc' }
    });

    const buildTree = (parentId: number | null = null): any[] => {
        return categories
            .filter((category) => category.parentId === parentId)
            .map((category) => ({
                ...category,
                children: buildTree(category.id)
            }));
    };

    return buildTree(null);
};

export const createCategory = async (data: { name: string; parentId?: number; position?: number }) => {
    const slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();
    return await prisma.category.create({
        data: {
            name: data.name,
            slug,
            parentId: data.parentId,
            position: data.position ?? 0
        }
    });
};

export const updateCategory = async (id: number, data: { name?: string; parentId?: number; position?: number }) => {
    let slug;
    if (data.name) {
        slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();
    }
    return await prisma.category.update({
        where: { id },
        data: {
            ...data,
            ...(slug && { slug })
        }
    });
};

export const deleteCategory = async (id: number) => {
    return await prisma.category.delete({
        where: { id }
    });
};
