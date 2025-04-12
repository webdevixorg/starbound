import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchProducts,
  fetchCategories,
  fetchSubCategories,
} from '../../services/api';
import { GridOn, FormatListBulleted } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import debounce from 'lodash.debounce';
import ProductCardGrid from '../../components/PageComponents/ProdutctCardGrid';
import ProductCardList from '../../components/PageComponents/ProdutctCardList';
import {
  Category,
  SubCategory,
  SubLocation,
  Location,
  Filter,
} from '../../types/types';
import { fetchLocations, fetchSubLocations } from '../../services/apiProducts';
import BreadcrumbsComponent from '../../components/Common/Breadcrumbs';
import PaginationControls from '../../components/Navigation/Pagination';
import CollapsibleSection from '../../components/PageComponents/Sidebar/ProfileSidebar/CollapsibleSection';
import ProductListSidebar from '../../components/PageComponents/ProductListSidebar';

const MainContent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [orderBy, setOrderBy] = useState('id');
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const pageSize = 20;

  const [filters, setFilters] = useState<Filter[]>([]);

  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subLocations, setSubLocations] = useState<SubLocation[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [locationOpen, setLocationOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(true);

  const fetchData = useCallback(
    async (orderBy: string, page: number, filters: Filter[]) => {
      try {
        const data = await fetchProducts(orderBy, page, pageSize, filters);
        if (data && Array.isArray(data.results)) {
          setProducts(data.results);
          setTotalPosts(data.count);
        } else {
          console.error('Unexpected data format:', data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },
    [pageSize]
  );

  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 300),
    [fetchData]
  );

  useEffect(() => {
    debouncedFetchData(orderBy, page, filters);
    return () => debouncedFetchData.cancel();
  }, [orderBy, page, filters, debouncedFetchData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsData, categoriesData] = await Promise.all([
          fetchLocations(),
          fetchCategories(0, 0, 16),
        ]);
        setLocations(locationsData.results);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchSubLocationsData = useCallback(async (locationId: number) => {
    setLoading(true);
    try {
      const subLocationsData = await fetchSubLocations(locationId);
      setSubLocations(subLocationsData);
      return subLocationsData;
    } catch (error) {
      console.error('Error fetching sublocations:', error);
      setLoading(false);
    }
  }, []);

  const fetchSubCategoriesData = useCallback(async (categoryId: number) => {
    setLoading(true);
    try {
      const subCategoriesData = await fetchSubCategories(categoryId);
      setSubCategories(subCategoriesData);
      return subCategoriesData;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setLoading(false);
    }
  }, []);

  const handleViewChange = useCallback(
    (type: 'list' | 'grid') => setViewType(type),
    []
  );
  const handleOrderChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) =>
      setOrderBy(event.target.value),
    []
  );

  const handlePageChange = useCallback(
    (newPage: number) => setPage(newPage),
    []
  );

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const categorySlugIndex = pathParts.indexOf('categories');
    if (categorySlugIndex !== -1 && pathParts[categorySlugIndex + 1]) {
      const categorySlug = pathParts[categorySlugIndex + 1];
      const category = categories.find((cat) => cat.slug === categorySlug);
      if (category) {
        setFilters([
          { type: 'categories', id: category.id, name: category.name },
        ]);
        fetchSubCategoriesData(category.id);
      }
    }
  }, [location, categories, fetchSubCategoriesData]);

  const handleFilterChange = useCallback(
    async (
      type: 'locations' | 'sublocations' | 'categories' | 'subcategories',
      id: number
    ) => {
      setFilters((prevFilters: Filter[]) => {
        const isFilterSelected = prevFilters.some((filter) => filter.id === id);
        let updatedFilters: Filter[];

        if (!isFilterSelected) {
          updatedFilters = [...prevFilters, { type, id, name: '' }];
        } else {
          updatedFilters = prevFilters;
        }

        if (type === 'categories') {
          // Remove subcategories of the selected category
          updatedFilters = updatedFilters.filter(
            (filter) =>
              filter.type !== 'subcategories' ||
              !categories
                .find((cat) => cat.id === id)
                ?.subCategories?.some((sub) => sub.id === filter.id)
          );
          console.log('categories', updatedFilters);
        }

        if (type === 'locations') {
          // Remove sublocations of the selected location
          updatedFilters = updatedFilters.filter(
            (filter) =>
              filter.type !== 'sublocations' ||
              !locations
                .find((loc) => loc.id === id)
                ?.subLocations?.some((sub) => sub.id === filter.id)
          );
        }

        if (type === 'subcategories') {
          // Remove other subcategories
          updatedFilters = updatedFilters.filter(
            (filter) => filter.type !== 'subcategories'
          );
          updatedFilters.push({ type, id, name: '' });
        }

        if (type === 'sublocations') {
          // Remove other sublocations
          updatedFilters = updatedFilters.filter(
            (filter) => filter.type !== 'sublocations'
          );
          updatedFilters.push({ type, id, name: '' });
        }

        // Remove subcategories if no categories are selected
        if (!updatedFilters.some((filter) => filter.type === 'categories')) {
          updatedFilters = updatedFilters.filter(
            (filter) => filter.type !== 'subcategories'
          );
        }

        // Remove sublocations if no locations are selected
        if (!updatedFilters.some((filter) => filter.type === 'locations')) {
          updatedFilters = updatedFilters.filter(
            (filter) => filter.type !== 'sublocations'
          );
        }

        return updatedFilters;
      });

      if (type === 'categories') {
        const selectedCat = categories.find((cat) => cat.id === id);
        if (selectedCat) {
          await fetchSubCategoriesData(id);
        }
      } else if (type === 'locations') {
        const selectedLoc = locations.find((loc) => loc.id === id);
        if (selectedLoc) {
          await fetchSubLocationsData(id);
        }
      }
    },
    [categories, locations, fetchSubCategoriesData, fetchSubLocationsData]
  );

  const handleBack = useCallback((type: 'locations' | 'categories') => {
    setFilters((prevFilters: Filter[]) => {
      if (type === 'categories') {
        return prevFilters.filter(
          (filter) =>
            filter.type !== 'categories' && filter.type !== 'subcategories'
        );
      } else if (type === 'locations') {
        return prevFilters.filter(
          (filter) =>
            filter.type !== 'locations' && filter.type !== 'sublocations'
        );
      }
      return prevFilters;
    });
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const filterList = useMemo(() => {
    const dataSets = {
      categories,
      subcategories: subCategories,
      locations,
      sublocations: subLocations,
    };

    const handleRemoveFilter = (filterId: number) => {
      setFilters((prevFilters: Filter[]) => {
        const filterToRemove = prevFilters.find((f) => f.id === filterId);

        if (filterToRemove?.type === 'categories') {
          // Remove the category and all its subcategories
          return prevFilters.filter(
            (f) => f.id !== filterId && !(f.type === 'subcategories')
          );
        }

        if (filterToRemove?.type === 'locations') {
          // Remove the location and all its sublocations
          return prevFilters.filter(
            (f) => f.id !== filterId && !(f.type === 'sublocations')
          );
        }

        // Remove the filter
        return prevFilters.filter((f) => f.id !== filterId);
      });
    };

    return filters.map((filter) => {
      const dataSet = dataSets[filter.type] || [];
      const name =
        dataSet.find((item) => item.id === filter.id)?.name ||
        String(filter.id);

      return (
        <li
          key={filter.id}
          onClick={() => handleRemoveFilter(filter.id)}
          className="m-1 bg-blue-100 rounded text-xs p-1.5 cursor-pointer inline-block"
        >
          {name}
          <span className="bg-white cursor-pointer w-4 h-4 text-xs rounded-full text-center inline-block ml-1">
            <CloseIcon style={{ width: '10px', height: '10px' }} />
          </span>
        </li>
      );
    });
  }, [filters, categories, subCategories, locations, subLocations, setFilters]);

  console.log('filters', filters);

  return (
    <>
      <div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>{/* existing code to display products */}</div>
        )}
      </div>

      <div className="shop-section container mx-auto my-5 px-4 sm:px-6 lg:px-8">
        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-5">
          <div className="w-1/4">
            <div className="container mx-auto px-2">
              <header className="text-left">
                <BreadcrumbsComponent />
              </header>
            </div>
          </div>
          <div className="w-3/4 flex flex-col sm:flex-row justify-between items-center gap-4 mb-5">
            <div className="flex flex-wrap gap-2 items-center">
              <ul className="flex flex-wrap gap-2">{filterList}</ul>
              {filters.length > 0 && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs text-red-500 ml-2"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="sort-by-select" className="text-sm">
                Sort By:
              </label>
              <select
                id="sort-by-select"
                value={orderBy}
                onChange={handleOrderChange}
                className="px-3 py-1 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="id">Date (Old to New)</option>
                <option value="-id">Date (New to Old)</option>
                <option value="price">Price (Low to High)</option>
                <option value="-price">Price (High to Low)</option>
              </select>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-2 rounded-md ${
                    viewType === 'list'
                      ? 'bg-red-500 text-white'
                      : 'border border-gray-300'
                  }`}
                  onClick={() => handleViewChange('list')}
                >
                  <FormatListBulleted className="h-5 w-5" />
                </button>
                <button
                  className={`px-3 py-2 rounded-md ${
                    viewType === 'grid'
                      ? 'bg-red-500 text-white'
                      : 'border border-gray-300'
                  }`}
                  onClick={() => handleViewChange('grid')}
                >
                  <GridOn className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 sm:col-span-12 md:col-span-12 lg:col-span-3 hidden lg:block px-2">
            <div className="border border-gray-200 overflow-hidden mb-6 rounded bg-gray-50 p-5">
              <CollapsibleSection
                title="Shop By Category"
                open={categoryOpen}
                setOpen={setCategoryOpen}
              >
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 rounded-md">
                  <ul>
                    {filters.some((filter) => filter.type === 'categories') ? (
                      <>
                        <li>
                          <button
                            onClick={() => handleBack('categories')}
                            className="text-blue-500 hover:underline cursor-pointer"
                          >
                            Back to All Categories
                          </button>
                        </li>

                        {filters
                          .filter((filter) => filter.type === 'categories')
                          .map((filterCategory) => (
                            <li key={filterCategory.id}>
                              <span
                                className="text-sm font-bold text-gray-800 cursor-pointer"
                                onClick={() =>
                                  handleFilterChange(
                                    'categories',
                                    filterCategory.id
                                  )
                                }
                              >
                                {
                                  categories.find(
                                    (cat) => cat.id === filterCategory.id
                                  )?.name
                                }
                              </span>
                            </li>
                          ))}

                        {filters.some(
                          (filter) => filter.type === 'subcategories'
                        ) ? (
                          <>
                            {filters
                              .filter(
                                (filter) => filter.type === 'subcategories'
                              )
                              .map((filterSubCategory) => (
                                <li key={filterSubCategory.id}>
                                  <span className="text-sm ml-4 text-gray-800 ">
                                    {
                                      subCategories.find(
                                        (subcat) =>
                                          subcat.id === filterSubCategory.id
                                      )?.name
                                    }
                                  </span>
                                </li>
                              ))}
                          </>
                        ) : (
                          subCategories.map((subCategory) => (
                            <li
                              key={subCategory.id}
                              className="mb-1"
                              onClick={() =>
                                handleFilterChange(
                                  'subcategories',
                                  subCategory.id
                                )
                              }
                            >
                              <span className="text-sm ml-4 text-gray-800 cursor-pointer">
                                {subCategory.name}
                              </span>
                            </li>
                          ))
                        )}
                      </>
                    ) : (
                      categories.map((category) => (
                        <li
                          key={category.id}
                          className="mb-1"
                          onClick={() =>
                            handleFilterChange('categories', category.id)
                          }
                        >
                          <span className="text-sm text-gray-800 cursor-pointer">
                            {category.name}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </CollapsibleSection>
              <div className="border-t border-gray-300 mb-6" />

              <CollapsibleSection
                title="Shop By Location"
                open={locationOpen}
                setOpen={setLocationOpen}
              >
                <div
                  className="max-h-96 overflow-y-auto rounded-md scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 
                dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600 hover:dark:scrollbar-thumb-gray-500 transition-all duration-200"
                >
                  <ul>
                    {filters.some((filter) => filter.type === 'locations') ? (
                      <>
                        <li>
                          <button
                            onClick={() => handleBack('locations')}
                            className="text-blue-500 hover:underline cursor-pointer"
                          >
                            Back to All Locations
                          </button>
                        </li>
                        {filters
                          .filter((filter) => filter.type === 'locations')
                          .map((filterLocation) => (
                            <li key={filterLocation.id}>
                              <span
                                className="text-sm font-bold text-gray-800 cursor-pointer"
                                onClick={() =>
                                  handleFilterChange(
                                    'locations',
                                    filterLocation.id
                                  )
                                }
                              >
                                {
                                  locations.find(
                                    (loc) => loc.id === filterLocation.id
                                  )?.name
                                }
                              </span>
                            </li>
                          ))}

                        {filters.some(
                          (filter) => filter.type === 'sublocations'
                        ) ? (
                          <>
                            {filters
                              .filter(
                                (filter) => filter.type === 'sublocations'
                              )
                              .map((filterSubLocation) => (
                                <li key={filterSubLocation.id}>
                                  <span className="text-sm ml-4 text-gray-800">
                                    {
                                      subLocations.find(
                                        (subloc) =>
                                          subloc.id === filterSubLocation.id
                                      )?.name
                                    }
                                  </span>
                                </li>
                              ))}
                          </>
                        ) : (
                          subLocations.map((subLocation) => (
                            <li
                              key={subLocation.id}
                              className="mb-1"
                              onClick={() =>
                                handleFilterChange(
                                  'sublocations',
                                  subLocation.id
                                )
                              }
                            >
                              <span className="text-sm ml-4 text-gray-800 cursor-pointer">
                                {subLocation.name}
                              </span>
                            </li>
                          ))
                        )}
                      </>
                    ) : (
                      locations.map((location) => (
                        <li
                          key={location.id}
                          className="mb-1"
                          onClick={() =>
                            handleFilterChange('locations', location.id)
                          }
                        >
                          <span className="text-sm text-gray-800 cursor-pointer">
                            {location.name}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </CollapsibleSection>
            </div>
            <div className="product-sidebar-items mt-5 p-5">
              <ProductListSidebar filter="latest" count={4} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 ms-col-span-12 md:col-span-12 lg:col-span-9 px-2">
            {/* Product Display */}
            <div>
              {viewType === 'list' ? (
                <ul className="space-y-4">
                  {products.map((product: any) => (
                    <ProductCardList product={product} />
                  ))}
                </ul>
              ) : (
                <div className="col-span-12 md:col-span-8 lg:col-span-8 xl:col-span-9">
                  <div className="container grid grid-cols-12 gap-5">
                    {products.map((product) => (
                      <ProductCardGrid product={product} imageHeight={''} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-5 text-center">
              <PaginationControls
                page={page}
                totalPosts={totalPosts > 0 ? totalPosts : 1}
                pageSize={pageSize > 0 ? pageSize : 1}
                setPage={handlePageChange}
                previous={String(page > 1)}
                next={String(page < Math.ceil(totalPosts / pageSize))}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MainContent;
