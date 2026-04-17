import { prisma } from '@/lib/prisma';
import slugify from 'slugify';
import { PostStatus } from '@prisma/client';

export const getPosts = async (params?: { categoryId?: number; status?: PostStatus; skip?: number; take?: number }) => {
    return await prisma.post.findMany({
        where: {
            ...(params?.categoryId && { categoryId: params.categoryId }),
            ...(params?.status && { status: params.status })
        },
        include: {
            category: true,
            author: { select: { id: true, name: true, email: true } }
        },
        skip: params?.skip ?? 0,
        take: params?.take ?? 10,
        orderBy: { createdAt: 'desc' }
    });
};

export const countPosts = async () => {
    return await prisma.post.count();
};

export const getPostById = async (id: number) => {
    return await prisma.post.findUnique({
        where: { id },
        include: {
            category: true,
            author: { select: { id: true, name: true, email: true } }
        }
    });
};

export const getPostBySlug = async (slug: string) => {
    return await prisma.post.findUnique({
        where: { slug },
        include: {
            category: true,
            author: { select: { id: true, name: true, email: true } }
        }
    });
};

export const createPost = async (data: { title: string; content: string; thumbnail?: string; externalStoreUrl?: string; categoryId?: number; authorId: number; status?: PostStatus }) => {
    const slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();
    return await prisma.post.create({
        data: {
            ...data,
            slug
        }
    });
};

export const updatePost = async (id: number, data: { title?: string; content?: string; thumbnail?: string; externalStoreUrl?: string; categoryId?: number; status?: PostStatus }) => {
    let slug;
    if (data.title) {
        slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();
    }
    return await prisma.post.update({
        where: { id },
        data: {
            ...data,
            ...(slug && { slug })
        }
    });
};

export const deletePost = async (id: number) => {
    return await prisma.post.delete({
        where: { id }
    });
};
