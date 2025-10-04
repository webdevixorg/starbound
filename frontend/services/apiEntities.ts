import axiosInstance from './AxiosInstance';
import axiosInstanceNoAuth from './AxiosInstanceNoAuth';

export interface Entity {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: 'brand' | 'model' | 'variant' | 'other';
  parent?: number;
  children?: Entity[];
}

/**
 * Fetch all brands (entities with type='brand')
 */
export const fetchBrands = async (): Promise<Entity[]> => {
  try {
    const response = await axiosInstanceNoAuth.get('/entities/', {
      params: { type: 'brand' },
    });
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

/**
 * Fetch models for a specific brand
 */
export const fetchModelsByBrand = async (
  brandSlug: string
): Promise<Entity[]> => {
  try {
    const response = await axiosInstanceNoAuth.get('/entities/', {
      params: {
        type: 'model',
        parent__slug: brandSlug,
      },
    });
    return response.data.results || response.data;
  } catch (error) {
    console.error(`Error fetching models for brand ${brandSlug}:`, error);
    throw error;
  }
};

/**
 * Fetch all models (for when no brand is selected)
 */
export const fetchAllModels = async (): Promise<Entity[]> => {
  try {
    const response = await axiosInstanceNoAuth.get('/entities/', {
      params: { type: 'model' },
    });
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching all models:', error);
    throw error;
  }
};

/**
 * Search entities by name
 */
export const searchEntities = async (
  query: string,
  type?: string
): Promise<Entity[]> => {
  try {
    const params: any = { search: query };
    if (type) params.type = type;

    const response = await axiosInstanceNoAuth.get('/entities/', { params });
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error searching entities:', error);
    throw error;
  }
};

/**
 * Get entity by ID
 */
export const getEntityById = async (id: number): Promise<Entity> => {
  try {
    const response = await axiosInstanceNoAuth.get(`/entities/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching entity ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new entity (requires authentication)
 */
export const createEntity = async (
  entityData: Partial<Entity>
): Promise<Entity> => {
  try {
    const response = await axiosInstance.post('/entities/', entityData);
    return response.data;
  } catch (error) {
    console.error('Error creating entity:', error);
    throw error;
  }
};

/**
 * Update an entity (requires authentication)
 */
export const updateEntity = async (
  id: number,
  entityData: Partial<Entity>
): Promise<Entity> => {
  try {
    const response = await axiosInstance.put(`/entities/${id}/`, entityData);
    return response.data;
  } catch (error) {
    console.error(`Error updating entity ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an entity (requires authentication)
 */
export const deleteEntity = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/entities/${id}/`);
  } catch (error) {
    console.error(`Error deleting entity ${id}:`, error);
    throw error;
  }
};
