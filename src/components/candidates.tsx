export default function Candidates(props) {
  const candidates = props.candidates.map((candidate) => {
    return (<li>Id: {candidate.Id} Name: {candidate.Name}</li>)
  })

  return (<ul>{candidates}</ul>)
}
