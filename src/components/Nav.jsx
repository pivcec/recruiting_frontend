import { Link } from "react-router-dom";
import styled from "styled-components";

const Nav = styled.nav`
  display: flex;
  align-items: center;
`;

const NavLink = styled(Link)`
  margin-right: 10px;
  text-decoration: none;
  color: inherit;

  &:last-child {
    margin-right: 0;
  }
`;

const Header = () => (
  <Nav>
    {/*
    <NavLink to="/">Home</NavLink>
    <NavLink to="/map-search">Map Search</NavLink>
    */}
    <NavLink to="/manage-domains">Manage Domains</NavLink>
  </Nav>
);

export default Header;
