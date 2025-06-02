// // File: src/app/components/FilterControls.jsx
// 'use client';

// import React from 'react';

// const FilterControls = ({
//   searchTerm,
//   setSearchTerm,
//   category,
//   setCategory,
//   sortByField,   // RENAMED from sortBy
//   setSortByField, // RENAMED from setSortBy
//   sortOrder,     // NEW PROP
//   setSortOrder,
//   categories = [], // You can pass this in if you want dynamic options
// }) => {
//   const sortOptions = [
//     { value: 'createdAt', label: 'Date Created' }, // Changed 'newest' to 'createdAt' to match API
//     { value: 'deadline', label: 'Deadline' },
//     { value: 'bidCount', label: 'Bid Count' },
//   ];

//   // Options for sort order (asc/desc)
//   const sortOrderOptions = [
//     { value: 'desc', label: 'Descending' },
//     { value: 'asc', label: 'Ascending' },
//   ];

//   const defaultCategories = ['ALL', 'Design', 'Writing', 'Research', 'Development']; // fallback

//   return (
//     <div className="flex flex-wrap gap-4 mb-6 items-center">
//       {/* Search Input */}
//       <div>
//         <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
//         <input
//           type="text"
//           id="search"
//           placeholder="Search Work requests..."
//           className="border rounded px-3 py-2 w-64"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>
      

//       {/* Category Filter */}
//       <div>
//         <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
//         <select
//           id="category"
//           className="border rounded px-3 py-2 w-40"
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//         >
//           {(categories.length ? ['ALL', ...categories] : defaultCategories).map((opt) => (
//             <option key={opt} value={opt}>
//               {opt}
//             </option>
//           ))}
//         </select>
//       </div>

      
//       {/* Sort By Field */}
//       <div>
//         <label htmlFor="sortByField" className="block text-sm font-medium mb-1">Sort By</label>
//         <select
//           id="sortByField" // Changed ID
//           className="border rounded px-3 py-2 w-40"
//           value={sortByField} // Use sortByField
//           onChange={(e) => setSortByField(e.target.value)} // Use setSortByField
//         >
//           {sortOptions.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Sort Order */}
//       <div>
//         <label htmlFor="sortOrder" className="block text-sm font-medium mb-1">Order</label>
//         <select
//           id="sortOrder"
//           className="border rounded px-3 py-2 w-40"
//           value={sortOrder} // Use sortOrder
//           onChange={(e) => setSortOrder(e.target.value)} // Use setSortOrder
//         >
//           {sortOrderOptions.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// };

// export default FilterControls;



// File: src/app/components/FilterControls.jsx
// 'use client';

// import React from 'react';

// const FilterControls = ({
//   searchTerm,
//   setSearchTerm,
//   category,
//   setCategory,
//   sortByField,
//   setSortByField,
//   sortOrder,
//   setSortOrder,
//   categories = [], // You can pass this in if you want dynamic options
//   // NEW PROPS for Status Filter
//   status,
//   setStatus,
//   statusOptions = [], // Expect an array of { value: string, label: string }
// }) => {
//   const sortOptions = [
//     { value: 'createdAt', label: 'Date Created' },
//     { value: 'deadline', label: 'Deadline' },
//     { value: 'bidCount', label: 'Bid Count' },
//     // Optionally add 'updatedAt' if you want to sort by last update time
//     // { value: 'updatedAt', label: 'Last Updated' },
//   ];

//   const sortOrderOptions = [
//     { value: 'desc', label: 'Descending' },
//     { value: 'asc', label: 'Ascending' },
//   ];

//   const defaultCategories = ['ALL', 'Design', 'Writing', 'Research', 'Development']; // fallback

//   return (
//     <div className="flex flex-wrap gap-4 mb-6 items-center">
//       {/* Search Input */}
//       <div>
//         <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
//         <input
//           type="text"
//           id="search"
//           placeholder="Search Work requests..."
//           className="border rounded px-3 py-2 w-64"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* NEW: Status Filter - only render if status related props are passed */}
//       {status !== undefined && setStatus && statusOptions.length > 0 && (
//         <div>
//           <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
//           <select
//             id="status"
//             className="border rounded px-3 py-2 w-40"
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//           >
//             {statusOptions.map((opt) => (
//               <option key={opt.value} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Category Filter */}
//       <div>
//         <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
//         <select
//           id="category"
//           className="border rounded px-3 py-2 w-40"
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//         >
//           {(categories.length ? ['ALL', ...categories] : defaultCategories).map((opt) => (
//             <option key={opt} value={opt}>
//               {opt}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Sort By Field */}
//       <div>
//         <label htmlFor="sortByField" className="block text-sm font-medium mb-1">Sort By</label>
//         <select
//           id="sortByField"
//           className="border rounded px-3 py-2 w-40"
//           value={sortByField}
//           onChange={(e) => setSortByField(e.target.value)}
//         >
//           {sortOptions.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Sort Order */}
//       <div>
//         <label htmlFor="sortOrder" className="block text-sm font-medium mb-1">Order</label>
//         <select
//           id="sortOrder"
//           className="border rounded px-3 py-2 w-40"
//           value={sortOrder}
//           onChange={(e) => setSortOrder(e.target.value)}
//         >
//           {sortOrderOptions.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// };

// export default FilterControls;


// File: src/app/components/FilterControls.jsx
'use client';

import React from 'react';

const FilterControls = ({
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  sortByField,
  setSortByField,
  sortOrder,
  setSortOrder,
  categories = [],
  status,
  setStatus,
  statusOptions = [],
}) => {
  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'bidCount', label: 'Bid Count' },
    // Optionally add 'updatedAt' if you want to sort by last update time
    // { value: 'updatedAt', label: 'Last Updated' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' },
  ];

  const defaultCategories = ['ALL', 'Design', 'Writing', 'Research', 'Development']; // fallback

  return (
    // The main container for filters.
    // It will be flex-wrap for responsiveness on smaller screens.
    // `items-end` aligns the bottom of the inputs if their heights differ.
    <div className="flex flex-wrap gap-4 mb-6 items-end">
      {/* Search Input */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-1">Search</label>
        <input
          type="text"
          id="search"
          placeholder="Search Work requests..."
          className="border rounded px-3 py-2 w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Status Filter - only render if status related props are passed */}
      {status !== undefined && setStatus && statusOptions.length > 0 && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
          <select
            id="status"
            className="border rounded px-3 py-2 w-40"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Filter */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
        <select
          id="category"
          className="border rounded px-3 py-2 w-40"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {(categories.length ? ['ALL', ...categories] : defaultCategories).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* NEW: Group Sort By Field and Sort Order */}
      {/* This div keeps them together visually */}
      <div className="flex gap-4">
        {/* Sort By Field */}
        <div>
          <label htmlFor="sortByField" className="block text-sm font-medium mb-1">Sort By</label>
          <select
            id="sortByField"
            className="border rounded px-3 py-2 w-40"
            value={sortByField}
            onChange={(e) => setSortByField(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium mb-1">Order</label>
          <select
            id="sortOrder"
            className="border rounded px-3 py-2 w-40"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            {sortOrderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;