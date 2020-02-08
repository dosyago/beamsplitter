# :gem: [beamsplitter](https://github.com/cris691/beamsplitter)

A new hash that passes SMHasher. Built mainly with a random 10x64 S-box.

Faster than SHA1-160, SHA2-256 and SHA3-256 (Keccak). Tested at ~ 750Mb/s @ 3 GHz.

[For a third-party verification of the SMHasher results, see here.](https://github.com/rurban/smhasher/blob/master/doc/beamsplitter)

## Some more details

- 256-bits of internal state. 
- 64-bits of hash produced from the last 128-bits of the state.
- S-box built from random.org bytes.
- beamsplitter is a family of hash functions parameterized by the random s-box.

## Aim 1 :white_check_mark:

Build a hash that **mostly depends** on an s-box. 

## Aim 2 :grey_question:

Any random set of 8192 bytes can, with usefully high probability, form another 10x64 S-box leading to another good beamsplitter hash.

If this works, beamsplitter would be a **universal hash**, or in other words the set of hashes parameterized by the s-box would form a [*univesal family*](https://en.wikipedia.org/wiki/Universal_hashing)

### Random S-boxes Experiment

Hypothesis: Picking any high-entropy s-box will lead to a hash that passes SMHasher with usefully high probability. 

#### Method

Get 8192 random bytes from random org and format as 1024 uint64_t numbers, a 10x64 s-box.

#### Results

All 3 random s-boxes produced a hash that passed SMHasher, with no failures.

### Making a Universal Family

In order to make this into a universal hash, it's not sufficient to simply replace T with any random, high entropy s-box and add an extra mix/round/constant somewhere to remove the couple of collissions that sometimes occur with a new s-box, it's also necessary to *hash* that input s-box using the original s-box, and use that *hashed s-box* as the s-box for the hash. This ensures, that, given two input s-boxes, the actual s-boxes the hash uses will be vastly different, which means you can't easily find two hashes that will hash a message to the same value (no more easier than finding a collission with the original hash, anyway). 


