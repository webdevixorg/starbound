import axiosInstanceNoAuth from './AxiosInstanceNoAuth';

export interface Entity {
  id: number;
  name: string;
  slug: string;
  description: string;
  type: 'brand' | 'model' | 'variant' | 'other';
  parent?: Entity;
  children?: Entity[];
  hierarchy?: string;
}

export interface EntitiesResponse {
  data: EntitiesResponse;
  results: Entity[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Fetch all brands (entities with no parent and type='brand')
export const fetchBrands = async (params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) => {
  try {
    const queryParams: any = {
      page: params?.page || 1,
      page_size: params?.pageSize || 20,
      type: 'brand',
      parent__isnull: true, // Only root level brands
    };

    if (params?.search) {
      queryParams.search = params.search;
    }

    const response = await axiosInstanceNoAuth.get('/entities/', {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

// Fetch models for a specific brand
export const fetchModelsByBrandId = async (
  brandId: number,
  params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }
) => {
  try {
    const queryParams: any = {
      page: params?.page || 1,
      page_size: params?.pageSize || 8,
      type: 'model',
      parent: brandId,
    };

    if (params?.search) {
      queryParams.search = params.search;
    }

    const response = await axiosInstanceNoAuth.get('/entities/', {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

export const fetchModelsByBrandSlug = async (
  brandSlug: string,
  params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }
) => {
  try {
    // First get the brand by slug to get its ID
    const ModelsResponse = await axiosInstanceNoAuth.get('/entities/', {
      params: {
        type: 'model',
        parent__slug: 'toyota',
        page_size: 1,
      },
    });

    console.log('Models response:', ModelsResponse);

    return ModelsResponse.data;
  } catch (error: any) {
    console.error('Error fetching models by brand slug:', error);
    throw error;
  }
};

export const fetchEntityBySlug = async (
  slug: string,
  type: 'model' | 'brand'
) => {
  try {
    const response = await axiosInstanceNoAuth.get(`/entities/`, {
      params: {
        type,
        slug,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching entity:', error);
    throw error;
  }
};

// Fetch entity by ID
export const fetchEntityById = async (id: number) => {
  try {
    const response = await axiosInstanceNoAuth.get(`/entities/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching entity:', error);
    throw error;
  }
};

// Fetch entity hierarchy (brand -> models -> variants)
export const fetchEntityHierarchy = async (entityId: number) => {
  try {
    const response = await axiosInstanceNoAuth.get(
      `/entities/${entityId}/hierarchy/`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching entity hierarchy:', error);
    throw error;
  }
};

// Fetch all entities with filtering
export const fetchEntities = async (params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  parentId?: number;
  search?: string;
}) => {
  try {
    const queryParams: any = {
      page: params?.page || 1,
      page_size: params?.pageSize || 20,
    };

    if (params?.type) {
      queryParams.type = params.type;
    }

    if (params?.parentId) {
      queryParams.parent = params.parentId;
    }

    if (params?.search) {
      queryParams.search = params.search;
    }

    const response = await axiosInstanceNoAuth.get('/entities/', {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching entities:', error);
    throw error;
  }
};
