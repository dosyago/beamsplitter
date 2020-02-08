# :gem: [beamsplitter](https://github.com/cris691/beamsplitter)

A new hash that passes SMHasher. Built mainly with a random 10x64 S-box.

Faster than SHA1-160, SHA2-256 and SHA3-256 (Keccak). Tested at ~ 900Mb/s @ 3 GHz.

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

#### Sample 1

s-box: T_0

Results:

- passes all tests, except
- fails sparse with a couple of collision

#### Sample 2

S-box: T_1

Results:

- passes all tests, except
- fails seed with a single collision

#### Sample 3

S-box: T_2

Results:

- passes all tests, except
- fails sparse with 2 collissions

#### Discussion

Because random samples in a high dimensional space are quickly representative and quickly converge to actual distribution over that space, I think this pattern is going to continue for the majority. Most (usefully high probability) s-boxes will be valid and fail on 1 or 2 tests with a couple collisions.

#### Future work

Make more tests. Also, in my development I noted that it's possible to pass these (seed and sparse) with small adjustments like:

- add extra mix line somewhere.
- add extra round (on key, state or seed) somewhere.
- modify initial state / seed constants.
