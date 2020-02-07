# :gem: [beamsplitter](https://github.com/cris691/beamsplitter)

A new hash that passes SMHasher. Built mainly with a random 10x64 S-box.

Faster than SHA-256. Tested at ~ 900Mb/s @ 3 GHz.

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
