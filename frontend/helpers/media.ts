export const getPublicImageUrl = (
  contentType: string,
  postId?: number,
  imagePath?: string,
  baseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BASE_URL ?? ''
) => {
  if (!postId || !imagePath) return '';
  return `${baseUrl}/${contentType}/${postId}/${imagePath}`;
};
