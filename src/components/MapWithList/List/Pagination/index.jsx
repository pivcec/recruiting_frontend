const Pagination = ({ page, totalPages, handleNext, handlePrev }) => {
  return (
    <div className="flex justify-between items-center">
      <button
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        onClick={handlePrev}
        disabled={page === 1}
      >
        Previous
      </button>
      <span className="px-4">
        Page {page} of {totalPages}
      </span>
      <button
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        onClick={handleNext}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
