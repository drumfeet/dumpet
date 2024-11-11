import { Link, useParams } from "arnext"
import { useEffect, useState } from "react"
import {
  createDataItemSigner,
  spawn,
  message,
  result,
  results,
  dryrun,
} from "@permaweb/aoconnect"

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" }
}

const getID = async (id, pid) => `post-${pid ?? id}`

const MAIN_PROCESS_ID = "yC4kFwIGERjmLx5qSxEa0MX87sFuqRDFbWUqEedVOZo"
export async function getStaticProps({ params: { id } }) {
  return { props: { pid: await getID(id) } }
}

export default function Home({ _id = null }) {
  const { id } = useParams()
  const [pid, setPid] = useState(_id)

  useEffect(() => {
    ;(async () => _id ?? setPid(await getID(id, _id)))()
  }, [])

  const hasWaitFor = async () => {
    try {
      const result = await dryrun({
        process: MAIN_PROCESS_ID,
        tags: [{ name: "Action", value: "HasWaitFor" }],
      })
      const jsonData = JSON.parse(result?.Messages[0]?.Data)
      console.log(jsonData)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div>postt : {pid}</div>
      <div>
        <Link href="/">back</Link>
      </div>
      <button onClick={hasWaitFor}>hasWaitFor</button>
    </>
  )
}
