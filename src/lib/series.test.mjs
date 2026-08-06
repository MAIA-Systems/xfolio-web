/**
 * Guards the two deterministic generators against drift. Both are ports of the
 * original bundle's PRNGs — the expected values below were captured from it, so
 * any change to the algorithm shows up here as a hard failure.
 *
 * Run: node src/lib/series.test.mjs
 */
import assert from "node:assert/strict";

import { buildOrderBook, buildSpark } from "./series.ts";

// Captured from the original build for spark(58.52, 30, 0.05).
const EXPECTED_SPARK_HEAD = [58.52, 57.14, 58.51, 59.04, 59.38, 59.11];

const spark = buildSpark(58.52, 30, 0.05);
assert.equal(spark.length, 30, "spark should hold 30 points");
assert.equal(spark[0], 58.52, "spark must open on the seed price");
assert.deepEqual(
  spark.slice(0, EXPECTED_SPARK_HEAD.length),
  EXPECTED_SPARK_HEAD,
  "spark drifted from the captured baseline",
);

// The walk is floored at 70% of the seed, and it must be reproducible.
assert.ok(Math.min(...spark) >= 58.52 * 0.7 - 0.01, "spark broke its floor");
assert.deepEqual(buildSpark(58.52, 30, 0.05), spark, "spark is not deterministic");

const asset = { id: "ast_test", pricePerToken: 61.25 };
const book = buildOrderBook(asset);

assert.equal(book.bids.length, 8, "expected 8 bid levels");
assert.equal(book.asks.length, 8, "expected 8 ask levels");
assert.ok(
  book.bids.every((bid) => bid.price < asset.pricePerToken),
  "bids must sit below the mid price",
);
assert.ok(
  book.asks.every((ask) => ask.price > asset.pricePerToken),
  "asks must sit above the mid price",
);
assert.ok(
  book.bids.every((bid) => bid.total === Number((bid.price * bid.qty).toFixed(2))),
  "bid totals must equal price * qty",
);
assert.deepEqual(buildOrderBook(asset), book, "order book is not deterministic");

console.log("series.test.mjs: all assertions passed");
