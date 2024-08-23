import React from 'react';
import { GrFormNext, GrFormPrevious } from "react-icons/gr";

const Pagination = ({ postsPerPage, length, handlePagination, currentPage }) => {
  const totalPage = Math.ceil(length / postsPerPage);

  return (
    <div className='pagination text-sm pt-5'>
      {currentPage !== 1 ? (
        <>
          <button
            key={1}
            onClick={() => handlePagination(1)}
          >
            First Page
          </button>
          <button onClick={() => handlePagination(currentPage - 1)}>
            <GrFormPrevious />
          </button>
        </>
      ) : (
        <>
          <button className='disabled'>First Page</button>
          <button className='disabled'>
            <GrFormPrevious />
          </button>
        </>
      )}
      <span>
        Page {currentPage} of {totalPage}
      </span>
      {currentPage !== totalPage ? (
        <>
          <button onClick={() => handlePagination(currentPage + 1)}>
            <GrFormNext />
          </button>
          <button
            key={totalPage}
            onClick={() => handlePagination(totalPage)}
          >
            Last Page
          </button>
        </>
      ) : (
        <>
          <button className='disabled'>
            <GrFormNext />
          </button>
          <button className='disabled'>Last Page</button>
        </>
      )}
    </div>
  );
};

export default Pagination;
