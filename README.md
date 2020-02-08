# :gem: [beamsplitter](https://github.com/cris691/beamsplitter)

A new hash that passes SMHasher. Built mainly with a random 10x64 S-box.

Faster than SHA1-160, SHA2-256 and SHA3-256 (Keccak). Tested at ~ 1100Mb/s @ 3 GHz.

[For a third-party verification of the SMHasher results, see here.](https://github.com/rurban/smhasher/blob/master/doc/beamsplitter)

## Some more details

- 256-bits of internal state. 
- 64-bits of hash produced from the last 128-bits of the state.
- S-box built from random.org bytes.
- beamsplitter is a family of hash functions parameterized by the random s-box.

## Development History

### Version 1 (Feb 7 2020)

First version had the following characteristics:

- 8 rounds ( 5 key, 2 seed, 1 state )
- Original random S-box passed all SMHasher. 
- 3 additional random S-box all *nearly* passed SMHasher. With 1-3 collissions failing 1 or 2 tests.
- Speed ~ 900 Mb/s.

### Corrections (Feb 8 2020)

I noticed some errors in version 1. A `uint64_t` was incorrectly cast to an `int`. 
I also noticed that the addition of the s-box value `M` was probably leading to some data loss, 
compared with adding it via xor. Finally a `uint8_t` was unnecesarily cast to a `uint64_t`, which didn't
change the value. 

Correcting these I noticed the hash performed a lot better. I tested of the the additional random s-boxes
and it passed all tests (formerly failing 1 or 2 with a couple of collissions). 

Noting the good performance, I began removing round functions.

First, I removed one key round, and the speed increased to 1100Mb/s and all tests still passed.



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

- passes all tests

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

### Making a Universal Family

In order to make this into a universal hash, it's not sufficient to simply replace T with any random, high entropy s-box and add an extra mix/round/constant somewhere to remove the couple of collissions that sometimes occur with a new s-box, it's also necessary to *hash* that input s-box using the original s-box, and use that *hashed s-box* as the s-box for the hash. This ensures, that, given two input s-boxes, the actual s-boxes the hash uses will be vastly different, which means you can't easily find two hashes that will hash a message to the same value (no more easier than finding a collission with the original hash, anyway). 


