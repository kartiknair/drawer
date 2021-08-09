export default function ConveyError({ error }: { error: any }) {
  return (
    <div>
      <h2>Oh no! We&apos;ve had an error:</h2>
      <pre>{JSON.stringify(error)}</pre>
    </div>
  )
}
