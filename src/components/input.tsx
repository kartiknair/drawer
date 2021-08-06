import styled from '@emotion/styled'

const Input = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid var(--grey-2);
  color: var(--grey-3);
  font-family: inherit;
  font-size: 0.9rem;
  border-radius: 0.25rem;
  transition: all 200ms ease;

  &::placeholder {
    color: var(--grey-2);
    font-family: inherit;
    font-size: 0.9rem;
  }

  &:focus {
    box-shadow: 0 0 0 0.25rem rgba(0, 0, 0, 0.05);
    outline: none;
  }

  &:hover {
    border: 1px solid var(--grey-3);
  }
`

export default Input
