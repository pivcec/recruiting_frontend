import styled from "styled-components";
import Pagination from "./Pagination";

const formatName = (profile) => {
  if (!profile?.data?.hits?.hits?.[0]?._source?.content)
    return "Unnamed Profile";

  try {
    const parsed = JSON.parse(profile.data.hits.hits[0]._source.content);
    const basicInfo = parsed.basicInformation || {};
    const first = basicInfo.firstName?.toLowerCase() || "";
    const middle = basicInfo.middleName?.toLowerCase() || "";
    const last = basicInfo.lastName?.toLowerCase() || "";
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    return [first, middle, last].filter(Boolean).map(cap).join(" ");
  } catch (e) {
    console.error("Name parse error:", e);
    return "Unnamed Profile";
  }
};

// Styled components

const ListContainer = styled.div``;

const ListUL = styled.ul`
  list-style: none;
  margin: 0;
  margin-left: 10px;
  padding-left: 0;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 4px;
`;

const ListItem = styled.li`
  padding-left: 10px;
  height: 20px; /* increased height to fit button nicely */
  box-sizing: border-box;
  border-bottom: 1px solid #d1d5db;
  padding-right: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background-color: #f3f4f6; /* gray-100 */
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NameText = styled.span`
  flex-grow: 1;
`;

const LinkedInButton = styled.button`
  margin-left: 10px;
  background-color: #0073b1; /* LinkedIn blue */
  border: none;
  color: white;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    background-color: #005582;
  }
`;

const EmptyMessage = styled.li`
  font-style: italic;
  color: #6b7280; /* gray-500 */
  padding: 8px 16px;
`;

const ResultsHeading = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
  width: 100%;
`;

const List = ({ profiles, total, page, setPage, loading }) => {
  const totalPages = Math.ceil(total / 20);
  const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

  const openProfilePage = (id) => {
    window.open(`/profiles?id=${id}`, "_blank");
  };

  const openLinkedInSearch = (profile) => {
    try {
      const parsed = JSON.parse(profile.data.hits.hits[0]._source.content);
      const basicInfo = parsed.basicInformation || {};
      const first = basicInfo.firstName || "";
      const middle = basicInfo.middleName || "";
      const last = basicInfo.lastName || "";
      const fullName = [first, middle, last].filter(Boolean).join(" ");
      const query = encodeURIComponent(fullName);

      const url = `https://www.linkedin.com/search/results/people/?keywords=${query}`;
      window.open(url, "_blank");
    } catch {
      alert("Could not generate LinkedIn search for this profile.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ListContainer>
      <ListUL>
        {profiles.length > 0 ? (
          profiles.map((profile) => {
            const name = formatName(profile);
            return (
              <ListItem key={profile._id} title={`Open details for ${name}`}>
                <NameText onClick={() => openProfilePage(profile._id)}>
                  {name}
                </NameText>
                <LinkedInButton
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering ListItem click
                    openLinkedInSearch(profile);
                  }}
                  aria-label={`Search LinkedIn for ${name}`}
                >
                  LinkedIn
                </LinkedInButton>
              </ListItem>
            );
          })
        ) : (
          <EmptyMessage>No profiles found.</EmptyMessage>
        )}
      </ListUL>

      <ResultsHeading>Results: {total}</ResultsHeading>

      <Pagination
        page={page}
        totalPages={totalPages}
        handlePrev={handlePrev}
        handleNext={handleNext}
      />
    </ListContainer>
  );
};

export default List;
