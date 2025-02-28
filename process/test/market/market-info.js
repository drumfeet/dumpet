import assert from "assert"
import { describe, it } from "node:test"
import { connect } from "wao/test"
const { dryrun } = connect()
import { wait } from "wao/utils"
describe("GetMarketInfo", function () {
  it("should return MarketInfo Data", async () => {
    const pid = 'B8gLHTXexfNT-fbml6Mn1AV1HBPJJy2OYQQ3j3weK6Y'

    // on mainnet, you need to wait here till the process becomes available.
    // WAO automatically handles it. No need with in-memory tests.
    const res = await dryrun({
      process: pid,
      tags: [{ name: "Action", value: "GetMarketInfo" }]
    })
    debugger
    console.log('Response:')
    console.log(res)
    const jsonData = JSON.parse(res.Messages[0].Data);
    assert.equal(jsonData.MarketInfo.OptionA, "Hello, World!")
  })
})