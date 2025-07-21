// components/dashboard/PageLayout.jsx
import React from 'react';
import PageHeader from './headerTable';

const PageLayout = ({
  searchQuery,
  setSearchQuery,
  open,
  setOpen,
  data,
  setData,
  children,
  TableComponent,
  FormComponent,
  options,
  dispatch,
  setSearchTerm,
  setCatSearchTerm,
  title
}) => {
  return (
    <div className='min-h-full'>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <PageHeader
              title={title}
              searchPlaceholder="Search by name or number..."
              createButtonText="New"
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onSearch={(value) => setSearchQuery(value)}
              onCreate={() => { setOpen(true); setData(null) }}
          />
      </div>

      <div className='p-6'>
        {TableComponent && (
          <TableComponent 
            setData={setData} 
            setOpen={setOpen} 
            open={open}
            dispatch={dispatch} 
            searchQuery={searchQuery} 
          />
        )}
        {children}
      </div>

      {FormComponent && open && (
        <FormComponent 
          open={open} 
          setOpen={setOpen} 
          initialData={data} 
          options={options} 
          dispatch={dispatch} 
          setSearchTerm={setSearchTerm}
          setCatSearchTerm={setCatSearchTerm}
        />
      )}
    </div>
  );
};

export default PageLayout;