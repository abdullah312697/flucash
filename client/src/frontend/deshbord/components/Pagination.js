import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
  
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  
    return (
      <div className="paginationContainer">
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={currentPage === page}
          >
            {page}
          </button>
        ))}
      </div>
    );
  };
  
  export default Pagination;
  