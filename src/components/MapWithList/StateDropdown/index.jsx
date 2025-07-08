import styled from "styled-components";

const states = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

const Container = styled.div`
  margin-bottom: 0.5rem;
`;

const Label = styled.label`
  margin-right: 0.5rem;
  font-weight: 600;
`;

const Select = styled.select`
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: ${({ disabled }) => (disabled ? "#f0f0f0" : "white")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-size: 1rem;
  min-width: 160px;
`;

export default function StateDropdown({
  label,
  selectedState,
  updateSelectedState,
  option = "Select State",
  disabled = false,
}) {
  const handleChange = (e) => {
    updateSelectedState(e.target.value);
  };

  return (
    <Container>
      <Label htmlFor={`state-select-${label}`}>{label}:</Label>
      <Select
        id={`state-select-${label}`}
        value={selectedState}
        onChange={handleChange}
        disabled={disabled}
      >
        <option value="">{option}</option>
        {Object.entries(states).map(([name, code]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </Select>
    </Container>
  );
}
