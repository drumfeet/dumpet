import assert from "assert"
import { describe, it } from "node:test"
import { acc, ArMem, connect, scheduler } from "wao/test"

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const mem = new ArMem()
const ao = connect(mem)

const signer = acc[0].signer

const getContractSrcData = () => {
  const contractPath = path.join(__dirname, "market.lua")
  console.log(contractPath)
  const contract = fs.readFileSync(contractPath, "utf8")
  return contract
}

describe("GetMarketInfo", function () {
  it("should return MarketInfo Data", async () => {
    const srcData = getContractSrcData()
    const pid = await ao.spawn({
      signer,
      scheduler,
      module: mem.modules.aos2_0_1,
    })
    await ao.message({
      process: pid,
      tags: [{ name: "Action", value: "Eval" }],
      data: srcData,
      signer,
    })
    const res = await ao.dryrun({
      process: pid,
      tags: [{ name: "Action", value: "GetMarketInfo" }],
      signer,
    })
    console.log(res)
    // assert.equal(res.Messages[0].Data, "Hello, World!")
  })
})
