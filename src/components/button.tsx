import styled from '@emotion/styled'

const Button = styled.button`
  display: block;
  padding: 0.5em 1em;
  border-radius: 0.25rem;
  border: 1px solid var(--grey-2);
  background: none;
  font-family: inherit;
  font-size: 0.9em;

  cursor: pointer;

  &:hover {
    border: 1px solid var(--grey-3);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 0.25rem rgba(0, 0, 0, 0.05);
  }
`

export default Button
