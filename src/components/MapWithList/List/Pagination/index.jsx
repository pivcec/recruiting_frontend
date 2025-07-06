const Pagination = ({ page, totalPages, handleNext, handlePrev }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div>
        <span className="px-4">
          Page {page} of {totalPages}
        </span>
      </div>
      <div className="flex gap-x-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={handlePrev}
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={handleNext}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
