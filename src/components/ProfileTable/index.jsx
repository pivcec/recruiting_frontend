import React from "react";

const renderValue = (value) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return <em>None</em>;

    if (typeof value[0] === "object" && value[0] !== null) {
      // Array of objects → sub-table
      const allKeys = Array.from(
        new Set(value.flatMap((item) => Object.keys(item || {})))
      );

      return (
        <table className="border border-gray-300 w-full mb-2">
          <thead className="bg-gray-100">
            <tr>
              {allKeys.map((key) => (
                <th key={key} className="border px-2 py-1 text-left">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.map((item, idx) => (
              <tr key={idx}>
                {allKeys.map((key) => (
                  <td key={key} className="border px-2 py-1">
                    {renderValue(item?.[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      // Array of primitives
      return (
        <ul className="list-disc list-inside">
          {value.map((v, idx) => (
            <li key={idx}>{v}</li>
          ))}
        </ul>
      );
    }
  } else if (typeof value === "object" && value !== null) {
    // Nested object → recursive table
    return (
      <table className="border border-gray-300 w-full mb-2">
        <tbody>
          {Object.entries(value).map(([key, val]) => (
            <tr key={key}>
              <td className="border px-2 py-1 font-semibold">{key}</td>
              <td className="border px-2 py-1">{renderValue(val)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    return value || <em>N/A</em>;
  }
};

const ProfileTable = ({ data }) => {
  if (!data || typeof data !== "object") {
    return <div>No valid data to display.</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {Object.entries(data).map(([sectionKey, sectionValue]) => (
        <div key={sectionKey}>
          <h3 className="text-lg font-bold mb-2 capitalize">
            {sectionKey.replace(/([A-Z])/g, " $1")}
          </h3>
          <div>{renderValue(sectionValue)}</div>
        </div>
      ))}
    </div>
  );
};

export default ProfileTable;
