# :gem: [beamsplitter](https://github.com/cris691/beamsplitter)

#### **[550MB/s - 800MB/s SMHasher](https://github.com/rurban/smhasher/blob/master/doc/beamsplitter.txt)** [![version](https://img.shields.io/npm/v/beamsplitter.svg?label=&color=0080FF)](https://github.com/cris691/beamsplitter/releases/latest) ![npm downloads](https://img.shields.io/npm/dt/beamsplitter)

**Beamsplitter** (named for the [optical device](https://www.edmundoptics.com.tw/c/laser-optics/754/?#Categories=Categories%3ANzYy0)) is a family of hash functions parameterized over the choice of a high-entropy random 10x64 S-box. All s-boxes tested so far pass all SMHasher tests. It's not particularly fast, and at ~550 - 800MB/s (depending on hardware) is faster than SHA1, SHA2 and SHA3. 

[Link to the SUPERCOP ECRYPT benchmark for beamsplitter](https://bench.cr.yp.to/impl-hash/beamsplitter.html)

**Related work**

I came across this paper a few years after having created beamsplitter. The ideas are the same. 

- [M. Thorup, Fast and Powerful Hashing using Tabulation, 2017](https://arxiv.org/pdf/1505.01523.pdf)

**CLI app included**

-----

A new hash that passes SMHasher. Built mainly with a random 10x64 S-box.

Faster than SHA1-160, SHA2-256 and SHA3-256 (Keccak). Tested at ~ 550Mb/s @ 3 GHz.

[For a third-party verification of the SMHasher results, see here.](https://github.com/rurban/smhasher/blob/master/doc/beamsplitter.txt)

## Some more details

- 256-bits of internal state. 
- 64-bits of hash produced from the last 128-bits of the state.
- A single 10x64 random S-box.
- beamsplitter is a family of hash functions parameterized by a random s-box.
- This repo includes a simple CLI app for hashing files or stdin from the command line.

## Aim 1 :white_check_mark:

Build a hash that **mostly depends** on an s-box. 

## Aim 2 :grey_question:

Any random set of 8192 bytes can, with usefully high probability, form another 10x64 S-box leading to another good beamsplitter hash.

If this works, beamsplitter would be a **universal hash**, or in other words the set of hashes parameterized by the s-box would form a [*universal family*](https://en.wikipedia.org/wiki/Universal_hashing)

### Random S-boxes Experiment

Hypothesis: Picking any high-entropy s-box will lead to a hash that passes SMHasher with usefully high probability. 

#### Method

Get 8192 random bytes from random org and format as 1024 uint64_t numbers, a 10x64 s-box.

#### Results

All 3 random s-boxes produced a hash that passed SMHasher, with no failures. This is in addition to the original S-box.

- [Original S-box smhasher results](https://github.com/cris691/beamsplitter/blob/master/Beamsplitter.T_original.result.txt)
- [T_0 S-box smhasher results](https://github.com/cris691/beamsplitter/blob/master/Beamsplitter.T_0.result.txt)
- [T_1 S-box smhasher results](https://github.com/cris691/beamsplitter/blob/master/Beamsplitter.T_1.result.txt)
- [T_2 S-box smhasher results](https://github.com/cris691/beamsplitter/blob/master/Beamsplitter.T_2.result.txt)

#### Random S-boxes Experiment #2

Pick additional random s-boxes in the same way as above, and record results here:

- T_3: Fail (passes everything except SMHasher/Sparse where there was **1** collission)

**Current p(PASS, sbox) = 4/5 = 0.8**


*Note* the fail could be noise because the test that failed (Sparse) has a random 7% chance of failing in any run. See [this issue on SMHasher](https://github.com/rurban/smhasher/issues/114). If that's the case, so far no weak, properly chosen boxes are found.

### Making a Universal Family

In order to make this into a universal hash, it's not sufficient to simply replace T with any random, high entropy s-box, it's also necessary to *hash* that chosen s-box using the original s-box, and use that *hashed s-box* as the s-box for the function. This ensures, that, given two input s-boxes, the actual s-boxes the function uses will be vastly different, which means you can't easily find two functions that will hash a message to the same value (no easier than finding a collission with the original hash, anyway). 

### Instructions for adding a new S-box

Some heuristic guides to properly choose your s-box:

- each value should be unique
- there should be equal numbers of 1 and 0 bits in the whole box, approximately
- choose the values randomly

Also consider the case where you have two sboxes 
identical except for one bit. Clearly that's not an ideal situation 
to create a family of sboxes because that one bit might be selected only 
some of the time to be included in the state and therefore will not contribute 
to changing the state a whole lot. 

Obviously in the circumstance of a long enough key and over the space of all possible keys even an sbox different by one bit 
will end up producing avalanche with respect to its adjacent sbox. 

So in order to create a family it's suggested that the sboxes differ by at least half their bits. As stated above, an idea I have about a way to do that is to take your candidate random box, or candidate source random data and then hash that with some hash function to generate the actual sbox data, to ensure all sboxes in the family are as different as possible. 

Of course if you prefer to design your sbox from the ground up you're welcome to but 8192 bytes is pretty large.

If you add a new random S-box and you find it gives some collisions, some tweaks you can try are adding an extra line like:

```c
 round( seed64Arr, seed8Arr, 8 );
 ```
 
 or
 
```c
round( key64Arr, key8Arr, len );
```

Where the other such lines are. In other words, add **one more round**, which tends to reduce collissions. 

### More use-cases

- As a basis for a cryptographic primitive (such as a PRNG, or symmetric cipher).
  - You could *key* the PRNG/cipher by hashing the key, then hashing itself to generate the keystream.
  - You could also *key* the PRNG/cipher by using the key to generate a random high-entropy s-box, which is then used as the s-box for the hash. 
  
### Getting and using

Use the C code from this repository, either in your project or as a CL-app (included):

```console
cd src
./build.sh
./bin/beamsum < 0x4613bc50e66b1334.txt
> 0x4613bc50e66b1334
./bin/beamsum 0x4613bc50e66b1334.txt
> 0x4613bc50e66b1334
```

or, for a JS implementation:

```console
npm i --save beamsplitter
```

Use in Node.JS:

```js
import {beamsplitter} from 'beamsplitter'
```

Or using Snowpack as a webmodule:

```js
import {beamsplitter} from './web_modules/beamsplitter.js';
```

Then call it:

```js
const hash = beamsplitter(string_or_typed_array_key, optional_seed);
```

### JS Implementation

- The JS Implementation produces the same value hashes as the C++ implementation.
- The JS implementation is ~ 750x slower than the C++ implementation.
- This is probably because of the use of BigInts to stand in for `uint64_t`
- It's possible to implement a 64-bit mult using 32-bit view which would remove the need for BigInt. I have no plan to do this.

### The default S-box

*This was obtained from random.org by requesting 8,192 random bytes, as were all S-boxes tested so far.*

```C
const uint64_t T[1024] = {
  0x6fa74b1b15047628,0xa2b5ee64e9e8f629,0xd0937853bdd0edca,0x4e9fb2b2b0a637a6,0x26ac5a8fac69497e,
  0x51e127f0db14aa48,0xea5b9f512d8d6a09,0xf3af1406a87de6a9,0x3b36e2ed14818955,0xb0ac19ef2dde986c,
  0xd34ed04929f8f66d,0xe99978cff2b324ea,0x4032cb3ecff8cb38,0xfa52274072d86042,0x27437346dec26105,
  0xec1cbf04b76aec71,0x6dd57b3dac56cd39,0x34e9021797e95aad,0xdc8d3363540c5999,0x773d283eeeabf4ab,
  0x373c522657461aaf,0x154cfe0f497d7f78,0x6d377183b5ca6550,0x614da5f6055e904b,0xd77b66b34896f00e,
  0x122538125d6adaef,0x1021e161206d9091,0x38407c4313aefdfa,0xd941cc5dafc66162,0xfc2432a6ea885315,
  0x5576dc02b68b10ed,0xd8449f9d4ab139a2,0xd333cbcd49cbacba,0x700d20430e06eeb8,0xdeb34810d6d0320a,
  0x6743363d6cc8ba68,0xbd183cb526e6e936,0xee62bf5ee97de5ea,0xf6b855e743e76853,0x83ac16a35d132df9,
  0x2046f2c70c2130b1,0xaadd5007102b5ee4,0x8eedac842e63cdac,0xba02956e43c18608,0xd2688af010adbeaf,
  0x4aaa5295377c17be,0x83792382ba198f10,0x6fc42849961a25b6,0x3501677f06fb1311,0x1e18b89705c224dd,
  0xa0a0b8684aa2e12d,0x30d19aac3d40898e,0x41dd335a29272e9b,0x5c5d445a07426e3f,0x6f13080e67946fdc,
  0x3ddabae21609bf08,0x8e6146d3cde11ca5,0x9eff76a4c39eacf4,0x71c66d0a423a21b7,0x68515c0b712bbc4f,
  0x5edd17cec412a735,0xa444f487c96f896c,0xc161d16d4e54041a,0x3a2d84d3e09bafb9,0x63a406b157a5f2f1,
  0x18292d6007f839ba,0xcaac5789618f2aac,0x6f516d95f749dd97,0xb5784409560e219f,0x12f0f0d6fbdcb81c,
  0x993d6c2a47089679,0xcc9247b35870aebf,0xa1ca8eff8b1bca70,0x7a1d015397e558cc,0xc504a4d4815f8722,
  0x3e44258e93472b26,0x11bd0578a36c8044,0x84c7087603a0a6ea,0x457d0c59e84c9ac8,0x32129275ee63dd95,
  0x66269220e943024d,0x197de12f9d6e5c72,0x06fdd09a4d6157dd,0xf8c1a8b51fe95716,0x41eeb6129149f6cf,
  0x42f510887a61de1b,0xf3d2aa6e4fe5949d,0xc0799007b85373aa,0x81577b167de515c3,0x01f424fc6b856270,
  0xff6247ed0658caa8,0x63ad005e620fe4bb,0xdb919b9f63c93174,0x5693dbd6c76c7683,0xdaa9b82e85e0355a,
  0x424c5c4e5672fc73,0x9de3ca332ba818f1,0xb28f375a58bc6c1e,0xef0af1e6041b9cd4,0x0418afb53ef5408f,
  0x9a37634585d3330a,0x3ab5aec014b097cd,0x384a0739a3ff7dc8,0x0ff31c11226e5d5a,0x71070735f1c16bb4,
  0xc4f78905f49a3840,0x561f68d6a5f44a81,0xb09bd8cd8d932357,0xf270b47652354fdb,0x47d6ca7bba50c2c7,
  0x2720590d7b2b7b54,0xcaac35df08cab300,0xd05759dee169d9fd,0xdb8d0d0403a6aafb,0xcd3ab85684ba537c,
  0xad69c4e5240c158f,0x65427c4ff3637db2,0x085ecbbf903a45ae,0xeafed57a94384c62,0xc99972367cd21eba,
  0xc1e2cf52270b20eb,0x825dad5142681653,0x47e99edc5e141d94,0x125813bc26e42e07,0x06f41d2441b172ca,
  0x5e9e640ed911730e,0x5900403342f0f362,0x57a600d157ee9945,0xbcc5d702f02dc7e0,0x8258cf5a1a6435ab,
  0xdf885b6a0343a3e0,0xadd74c04a503b09a,0x0ea210122eeef589,0x5217fd50f3ecaf85,0xd0c39849df6b4756,
  0xf66d9e1c91bd0981,0x0f355b00f40e3e6b,0xc01dabcd14518520,0x58691b4fa9e7d327,0x357616c77c22fffe,
  0xb9fbf8de2ed23303,0x0195932bc205c466,0xef0763590a08a50d,0xf546866c0028a938,0x41cc8732eaad496a,
  0xadc61f16374896c6,0x5eb8f93f25ad0457,0x240f00f5db3fae25,0xcc48503596dc01ef,0x351baaa904a306d5,
  0x7111179ae328bb19,0x6789a31719d5d453,0xf5318492c9613de6,0xa0e8c24f3f0da716,0xac15d68d54401b9d,
  0xadafb35cf63092ee,0xceb5f8d63c7fec4c,0x1ae71929b980fc9d,0x6efdc5693ef4ee2a,0xbedd8334cade7855,
  0x06f1b768b476a249,0x9e614bedf41dd639,0x9eca9c6c9e389a5d,0x76999bf01b912df2,0x04d52fb2ac70ab31,
  0xe467ea8172f5d066,0x356ed51bb0e094ae,0xab2047c21b54d8ba,0x21dbbfa0a6157474,0x7de36edec62f1997,
  0x306ef59f5204a58c,0x954135a769d5b72e,0x9d7774a0c2d29380,0xc03acfd63ac6b88c,0x9989d5ee565322e6,
  0x19d1a58324bdd145,0xe74685383cc6b27c,0xf9edffe1c4d81108,0x94950b5b6247cb43,0xe3fa8c6468d419eb,
  0x29981bd802f77ac5,0x6cf1a6cab28c1c36,0x1d34a382a5d48973,0xcd1d5d546e5e4d3d,0x4ad78b4a37e52322,
  0x24da17671ab463f2,0x527504b7c7bc5537,0x7ba1d92e1969b2b5,0x53a130812c49d64a,0x503af48d9510f1d7,
  0x719db8a348dee165,0xa85e4fad1f343e67,0xdafc1fa9203d2d45,0x7730f245c903a407,0xb7c04e53f913aeae,
  0x39ed817e1e039153,0xf415ea2b3efc7606,0x15e3c53fe43f104d,0x1b71e4d83ccba83c,0xfe088f4c90812841,
  0x1ff8e2ee0a04b6ae,0xf4f4a23612b9eed2,0xc596a66051b8aca1,0xbc898edd3370a8dd,0xce7638a7a2f9152e,
  0xd99192635c0d5c92,0x62038c87c094a1ff,0xa73f1bcaac7343af,0x93c797804faa5ff3,0x9da7407c705da1f0,
  0xa52cde7d37fef9f0,0xb93a7db97e3fa7ff,0x75ee91392c60fb6b,0x4d7f8e3db9383ae0,0xe0aec397d5290d06,
  0x159a20f22d740d81,0x231416cff9a9b014,0x71ed3a6e513b4795,0x190b08ebcb87f3bc,0x36bb0bcb0e8df593,
  0xc1e63cdc4d78dfb3,0x36e2c57ba6799460,0x280c0618b19f63dc,0xca2b8e49d6c71d2d,0xc881e59705270f09,
  0x26fdf0dbb5f2f451,0xc6d1a3697ca86855,0xd00755a203980eb5,0xa85962163dd7de95,0x622b7a1d2531d00e,
  0xb6c1cfba74436ef7,0x9578891a720bf317,0x5e325058bd3a343a,0x9a468a5a888a475f,0xa57f0edb414a0589,
  0xa044aef7ea680f8c,0x2036717cee9b991a,0x3925631ec66cb8aa,0xdcb6a5da6b2fc78f,0x17a8cd724b7b5e26,
  0x1c704c6a48a2dae0,0x87d8f6738a0c30bc,0xd8580262a4801240,0x5812cea521ffaeaf,0x21b6ff923871f14c,
  0x922dbd45c2b307d1,0x5c67ecbaace24d31,0xb90f5e3acfaeff9b,0xea5aa9f2f14efeb1,0x08003af95ab5ce92,
  0x5a39361e05692622,0xd4b8cddc309e44da,0xe20bfe5f0a1343d9,0x13848357d100b2b3,0x912a1b220fa678f5,
  0x7631242b7f6d6365,0x5a9f9a3284d95674,0x0d5b02c98afd4279,0xede70dbc04a7a3d9,0xadb3f72865ba580e,
  0xc4a3c11163562e90,0x482e567c69b6b128,0x38ec96bfcb4d965d,0x923fe02a6b4bdabe,0x0ae0ca91a2be0579,
  0x137401e7f2acf3e8,0xfdad100e85bc5622,0x9c07483343c8030f,0x71872f8555dbd0a8,0x8de5873dbfa538e0,
  0x2922d0d9a2d9eb02,0x2744006cfc375d0c,0xa82c09537574f583,0x2ab2d255e73f6f83,0x6cc5f73b682b3701,
  0x6e59fc51ee28845d,0xe536b381533cc4cf,0xfd2ac9f30025e109,0xc26cdfa60b8be153,0x62da136e08f0f885,
  0xeb6a7a065b640357,0x7462b101e2adb3ff,0x996ec340bf52ea07,0xf0aa2a872333e60c,0x222884f9c4632341,
  0x32b5289d94dac82e,0x7cdd99055bd35f17,0x92d3d262aefe21bc,0xc6c1b1029eb0dd4c,0x28f046ec80f3c975,
  0xc1f0c2d9745c5cb7,0x92ada28cf6f7fe0b,0xdfb215a8df753a03,0x942ecdad535f962d,0x7d739b8c0b7a1669,
  0xee95286e88be8510,0x4ae71aa9d3c3d36f,0x2bd6d5d12452cc38,0x16fa1504fbedf267,0x4b835f8377f3937d,
  0x0004374053160cb7,0xe44a676c90906fe8,0x2389c459f53fbdcd,0x4a7031455481da9e,0xb72c293d969a40cc,
  0xd9b72ee09dde404d,0xa31f4f98c5aabc97,0x56f240ad0aea491c,0x86264ebf858d67bf,0x93fd3b332948fd87,
  0x79899120e2d72215,0x36dedea1a614643e,0x1c5e947b88cba0f6,0x20ec77907c771a4f,0x587a65fe2c8f5487,
  0x9b5431d881ff3b4a,0x8f55b2fd967902d7,0xebd59a640fee9b7e,0xd5a77b39543d5bef,0x5dbf440d204f5d0f,
  0x4e22065f53ba213e,0x4611a2d169ad5a0b,0x41ea9888cb5be7d1,0xf8a661f2359be997,0xde83a9e3a6562631,
  0xd66dedc223dad775,0x162e54732874a52a,0xf6d91b1963c23d56,0x56d3c9a025a95772,0x92ddff0a1caeb05c,
  0x6cbeb9f263443bd7,0xb4ad540e1b11894b,0xcfa573f2f78d8b29,0xad477ed16d45543f,0x0d0283973ed3423a,
  0x5307f93f3654f284,0xbc9b362f504b145b,0x5661193dc5bcb5ff,0x151c9b1c7c0f246a,0xad25cfcfd5e399d2,
  0xc5855adf08226db2,0x5a027c03c078be13,0xc2465bfb0dc5b99c,0x8aaa55a9eca79b60,0x797a7c2608c23d9e,
  0x692b8d7da8c7f748,0xc23c7b1ab3e883e1,0xe1ebb866f32ac6cf,0xca6be5075b5046f9,0x3105a0555f6a3bac,
  0x525b7cc4839ea6c5,0xce1dd2aad7e83cf1,0xb4a9105674d79be6,0x667eb8384834f7db,0xb200a7a30f789150,
  0x4ba4d2c780055821,0xb48a01ad5f7474c6,0x3310ba4a1e25aab8,0x64379d2408fd5735,0xf11e9788704e5e0d,
  0xe9866ab0a8e90f4e,0xaa344ffe50f7a934,0xcce37a15b3870924,0xe22135597a867f1c,0x8770a58d7fe57f99,
  0xcafbbc8d2024bcbc,0x2307e7f0fcdb1909,0xdd016550b9ed2b2a,0xd0bcf0e9dee7df90,0xe82d2e7daeab325c,
  0x721a2aba71709aa7,0x38cfabc260602614,0x3099ccb02b73b4c8,0x00250ce48fd67df0,0xcace64d8984b19cf,
  0xee305dcbae8615ca,0xd187da55485b86ef,0xebea32b2455e6486,0x77cb912fa927d5c5,0x911002ac8b62cbd8,
  0x70730c24c32c5870,0x0a7cb6f89e988a83,0x6b5e00839b7db787,0xecae9f4cfd9ce924,0xae09926b714019a5,
  0xbc1b2c59bc5ce769,0x592756761e90349f,0x95c9a69a21936de3,0x192b2119ee48eb9a,0xcd8d11ebcd8a71c2,
  0x34de8d4cad3151d6,0x0fc4f3baf540eb1c,0x88bd85e02b2ec0e2,0x5b65423e815dafb6,0x66ec6fadd29f273e,
  0xc3622fbc1f1c7bd0,0x50cc102827ff1acf,0xe73cab705018a55f,0xcd552b588a227f38,0xc462735f28a9c597,
  0x3e3ccb00a16906e1,0x79bdf5d7e7dfa593,0xb333b6942d5db3a9,0x3566edd901f25f20,0x8c5fe3e063253c7b,
  0x9f0aa4160fb652ee,0x2361d9bca2c92f43,0x2d6a0339fe1de8ee,0x389b1bd9476b0470,0xd7fa2522f0da451e,
  0x43e6a01d67c62b2d,0x5bdc15971dc0d5b3,0x38a0a80acbadf021,0x2c66125ec66e1fad,0xb58f61bb53b6a9ff,
  0x492142919b2d61d6,0xd905263cc927ebd9,0xca15f966e2279122,0xf9dc67f8101119c9,0x7f6755699c23d8c9,
  0x26146d38a23b0bdf,0x0166c70bc773d9aa,0x5b3317113904ec75,0x5d3c4311b21e44d1,0x479c13c75df8cf18,
  0x75a880dd38a8a4ff,0xdf378e2eb432708d,0xca1cb0f76b1c5f04,0x06c76e876516eb46,0x965c10e60ec202ad,
  0x67b18e2140e0aad3,0x203ca38572b212b8,0x72adad835dd333c6,0xdd02aa349680a96a,0x69ab0df01d4b3eab,
  0xfebfd83a2c43afd1,0x0dcd90c392b9fae4,0x8a87b8033e4cd8cc,0x3902150c36e99880,0xb5b655e071474ebc,
  0x6c2dc9eeaffbd8d8,0x3cf62bfa4986f0fe,0xa68eaf0719a9afbc,0xde1f4e9a4b190aef,0x7fbc9e8538999e56,
  0xf6d5e9db2208a40c,0x93b13abaddf4554c,0xd8b5e4ad9911629f,0x6fdb9d7376488e52,0xee604a7ce20d75ad,
  0x94ec4abbaa9c2c1d,0xdbd148c4fcd05ec1,0x0865c7c3b380a005,0xa6da59a56992f211,0x2eb1dc9f941c83ef,
  0x3bf5ccf06910fae7,0x23a70e117e1f29f0,0x4273791acbf6c4e5,0x338414ec6b5e5d60,0xa5873517e3d057d9,
  0xea88400a890764f6,0xc0569d573ca5364f,0x4c3fc02fc93316e0,0x76597f718657e577,0x17052b8440c7d824,
  0x9a7ec0a30be21a00,0xab0453ac2173dac9,0xb6f3706820512809,0xef44f0b07d46180a,0x5e9aa12e99509a72,
  0x6231337efc0182ca,0x0963321a419da89b,0xfda3e7ad51f82b5e,0x1ab8790c2f5bf1a3,0x9ef177b8a59f28c0,
  0x27d1c87da66c1652,0x1bd6bdf27c49d109,0xc151e2a66994d599,0x5e1b8d826b8c12a9,0x39f41d57213261b5,
  0x16a57bd0bc78aada,0x0127e7f9699b55c7,0xd79eccc9f9d703be,0xb41b81c61ba66d7d,0xcf8b79dcb95dce93,
  0x5ca102a7743a6e0d,0xf422a0c3a2ad7b28,0x4a9137b4a0f03724,0x907dcf6425c829c2,0x15551fd4432261fb,
  0xa057dfbd55ef436c,0x8b2541b9e0e0fa7e,0x7262166dcdf4b67e,0xcf6533e5c608aaeb,0xd6763d3967359786,
  0x1f6b0228d257c676,0xc268c1064d2b458a,0x6d8b2f6e75d2b613,0xfaaf5adc43d72807,0xb6376765e344f9f8,
  0xa8e18dd16a4bd501,0xa71aa12a8ec11351,0x1daaf130b537ebe0,0x2e8aa415959d5d8f,0x2813ff3a3e5cbcfb,
  0xf0fdd1d6d16a7c23,0xbf2b55d2ecf0ee55,0xbd4e9bec299381d0,0xac8827ab807eb180,0x8514d75ac3b43b0b,
  0xc9b5c78e45fb38a8,0x4b66e6e7b797cd8f,0x1a482ffa6870a2d3,0x98f55f701d4bf919,0x7c0fda20e7e26ef8,
  0x6ef795976fca3b54,0x79801cd422fa95cd,0xce8a72301dbbe230,0x5e79f4c925bdd0e0,0x5729e93c99cc12b3,
  0x76d022747522392a,0xb9d7652e917a6bc4,0xc2978462dfa9551b,0xac081b4a7528b0ce,0x5b7799fe02443b33,
  0x6676e5687742e76a,0x3e9836e33caf452b,0x96ff93e427173943,0x30fa2f987359e0f6,0xfaa730326c478363,
  0x2bb0560d8986947e,0x9f7c01d35aefc68f,0x6b81189bd90a0e45,0xd592d2ad2df04128,0xbcd0e0fe02816ec6,
  0x1d6d84e5c1f8df0f,0xc4b55a73da2f8713,0xdbd6510e7ad24d26,0x7e3452b770e259bd,0xd5fe716f2c3ee835,
  0x63a6d74ef78acd1d,0x3bd673b27d5aa140,0xe394f3a2a4f6d465,0xf02f642cda7fee7e,0xe17ee2617b3d366a,
  0x41cdb92402dce780,0x4e5c54024fd18f6b,0x6f45dd1c7c5a3f12,0xf6fd2b3f9ccda563,0xe7628d358d971e26,
  0x4dabc984370ed105,0xec05f7d5c53cb70b,0xf48eccbc216dcf71,0x8a571d0cb256f131,0x4c05466392e32549,
  0x91d3f9324ef03c3e,0xec0591069697e868,0xa77da4079db8ffd8,0x287335de3951784f,0xe7afb90b4adbbf33,
  0x96e785b0c621dbbf,0xc7f54753a5e1d81b,0x4a3a42229fc7491e,0xc9560ea788a62881,0xe34b9ee97b5bef12,
  0xfae309a9fbff0656,0xbc23f738a0bf4c58,0xc6dd1ed9a7a706de,0x3473045c7f760007,0x89b5f0a2e0ace69b,
  0x7433c584785f3321,0xa38220fab7357fc0,0x04e1d70ec8db6456,0xa86065368c31fd72,0x926cee3a66885fb3,
  0xc09c39dbdb8240bc,0x1ee291407a9ac9db,0xa6120818b86fd032,0xa4c3a1cbf6a6666f,0xb34ce856697db755,
  0xe3ef1a7123649d75,0x814ea4e8549f30bc,0xc8c12f327c1ee0a3,0xc4ad0d22dbe77043,0x608451fb3ab06a00,
  0x2e1141be52867cb9,0x04b92abd9485965f,0xcf91f012eb16b951,0xacc0a45db481b3b3,0x523f65d99013b4d9,
  0xf333b8f8613fae1f,0x8b651a304f1c80b0,0xa91ecd6f061480d2,0xbd01125685871081,0x9933950983b6d41e,
  0x1f4130fd7912c3e6,0x333230fc9385a4ba,0x9d2d764680fb1581,0x277e6bb16761eabf,0x1829af028f40b602,
  0x9783144e64561566,0x410d30cd66cb4e92,0xce0e0df02a7ac717,0xdbfc28dabb65c1e2,0x5a83f419f0610b35,
  0xb0706efb6f56176b,0x684148ee29c2a3d6,0xc47213009755db33,0x2600f460fbea3831,0x7037ec48a50dc3ec,
  0xa761879a39764433,0xcfd6983de3381424,0xfdc2524f5d605fc4,0xbe84a33131a412c9,0x1bd73706e51699b5,
  0x7aea62c60dffb5ab,0x010fec687da2bbf4,0x56aa74a28e54f75c,0xba52dd2bb4019afe,0x6ae298d992a98093,
  0xdbfc6eddb2348c70,0xeab81b5b034b7836,0x692b0fc00c8986ba,0x02adf5476f927b39,0x0173c9bb282a94e7,
  0x1e617773e554c877,0x241d5db92d0aa39e,0x902c43c4be589249,0x0b817ad8f9617273,0x43508b7fb53d5d1f,
  0xaf1d845886eeb50c,0xc645d0758b0a08f2,0x3d1339390783be12,0x376e4919f2fc41c9,0x392c5bb8475370e6,
  0x5e891f54eec6c015,0x16a12880b9ac0923,0x6437af0453c57f36,0x8dd1ec0ee82c5835,0xc4738296f5085ef5,
  0x68c5d2b2d2d06381,0x8a4627fb8fbef8df,0x9d56ea18dd2590b3,0x8dbdd1fd0ca96586,0x9c17bd827cc151ab,
  0xdddb70eb24c36775,0xb56277dfd02a9c4d,0x5a8388d255264a83,0xcb7207a0b0155fa4,0x2bbc2967864dd11a,
  0x19fb91190adfc85a,0xed562d76a7e244c3,0xf5438c5585588610,0xbc16ff713cde2e48,0x42248c858cf837cb,
  0x59c8eeb9769cf08a,0x0f5260cc1dc624b7,0x6b880672b5ebfdd5,0x2e6d6cf57e3365cf,0xe994b274628cdb20,
  0x939e00fbb43765d8,0x093150ef5c7cd883,0x8ae15f57f13b42f1,0x3af5014a74f18355,0x7e1a2d0c860bcd23,
  0x796312eee1445e38,0x1cbde8ef8bdfee3d,0x207592ed0910de04,0x150e839a79142012,0xb920f5ff40de84a6,
  0x0c05b146a932213b,0x7406c434e2d92546,0x19376004d1fc67aa,0x82f3677fcf0dd552,0xd9daf63e3aa745a9,
  0x8e1e09d0a9676fdf,0x2cb86571c0289958,0x4c4c12eb3a97b760,0x1e3468d9bf56d00c,0x11f90498f14cb4a4,
  0x251664b4422a7c58,0xad10e44d41c2b7c5,0x663cf17121b6d221,0x3fe40cdc49c541b8,0xb1b1a8b2a941f9c7,
  0x83ffae6e34d4eb78,0xa4564673c6728fbf,0xe1499f6bd812a4b9,0xfb5507a915ed36a3,0xe055a829c62de53c,
  0x1ea06fc53acba653,0xce0f8c15fd8f2258,0x7dd42e43e5ef6f4b,0x0c55aecd7e1adc10,0xc31b0e4d3a4e8b1c,
  0x1205469d91599780,0xbba5d6df94390b83,0xc97925cae2f17697,0x3b98f3dc9e15ea08,0x878203758954cd36,
  0x818deaef5ba91f77,0x6f8f1786214acb89,0x26c5c2162849ece8,0xaf1c297b73471dd3,0x415c497c9fa7e936,
  0xc1804e923aa3cce6,0xdd7ca8ffb78dc68c,0x5b912445ed7ba89a,0x95dec0af89a1f157,0x7041c032d1fa5266,
  0xc569835beabc20df,0xcc662c0dbb7baaef,0x20d5d2c1383ff75c,0x7efdaae3e1c4eaaf,0x3575fad9533be200,
  0xfb0fb500836d48dd,0xd211a5090e6d53e2,0x34afe4050a01467c,0x63457fe7bfe187c3,0xc3ee000cb474d925,
  0x4fd32cbbb8326e22,0xc2abcd1fc9bf14c2,0xf34b534e55f28258,0x094ff2a11972ddec,0x9744b26f181926a9,
  0xa7fe6a0982135b29,0x0f8d9e7a0de7d61b,0x4bcd12d1b5d3d8a6,0x706e34dbac81bd39,0xefea01605e9304c6,
  0xee3bb6d1e510efe1,0x84a094db3f4620f8,0xf1752fc679d6aeb3,0x54921e5d6949a43f,0xd3616f81f2ff8c55,
  0x8bd9584eb62232bd,0xa990035eef6e7b13,0xd4c56de5c11dcdda,0x8048c23ec8bd072b,0x407539904d984e51,
  0xeaf5a1d46eb3779b,0x4b06e5769362f357,0x931f75e21bc0d143,0x9369439b81c92fc4,0x059fccc0d4afbb45,
  0xd072671b3c927118,0x61b6803f95c41115,0xacb4b2c4381da3f5,0xd73bf897ee871c72,0x241c9d52c953d3c0,
  0x083c079e704d7b96,0x8c431ee43e5171a5,0x66079596998b96b6,0x041ea35d207b478e,0xbe698683cf7b258e,
  0x5457365cf6cbc5bb,0xc166c3ef7006b02d,0x27789ff1e5365132,0xae4a02397d308867,0x0388704d03d7b613,
  0xf5c9d782d3fd58e3,0xb51c3fe53965624e,0xf785b86e7fe0adec,0x19f72a9ef3a215e8,0x19db58361e6633d9,
  0xf1fe7a08693d64ab,0x07c3310adc3bbf03,0x742e87d333077816,0xe817529af0f04970,0xe7f343c941a044ff,
  0xf9693fb4f37b4d2c,0xb99da4a0b6ccb1ed,0x4eef654d39c7f631,0xd06badd9354befc8,0x3dea38b48a4fb6cf,
  0xf6551a2de11ec63d,0xf0dd7ca2d08731e5,0xfbbac6e989684aff,0xe2b65b698f6ea652,0x679e2fc32595fb51,
  0x6547fdc240571414,0x6809f663de2d0466,0x6c6b7a0a40a5e48f,0xe5f43660d891606e,0xa44f283a5a5c10fd,
  0x95635b53a60083be,0x7e0f003a2698a45c,0x2fd0eb2a3cb4db79,0x7416380640ad33c7,0x988de04a8bfe794b,
  0x6d00569ebd6839ff,0x22ddd7d3d0efa384,0x20f9c1ae73b1a651,0x32386da97bb626af,0x263c358b8e1975fe,
  0x32bd1e4fdb3e7f7c,0x2ebb53af95ab07db,0xeccc526f7e6aca61,0x186fd1f3ad161e28,0xf96dd58eca026372,
  0x0403c8572fee3bf3,0x2598261d29b22e84,0xa4027ffeed481ae0,0xe2f690ddcdb0fdaf,0x95d11d0d60c528fd,
  0x0cc242f0eeae1d6c,0xfa3440087835377f,0x3d8fad475b8139e4,0x8e92fce862d8a97e,0xc53bc4cb5ed50eb4,
  0xc8f91ece0194e8d4,0xf78d7c6b5cff07e1,0x3163d8458b924665,0xc2ae6dc185c739bf,0x2943e3eae337c6c6,
  0x96bd36f0da4a49f7,0x98753f33282f27bf,0xd5c33455bf0f69fd,0x78cc9f69e0286682,0x0631fadc21ec437c,
  0x521c3db58b6b1170,0x2333f0f70e46b5cf,0x87be027b8d434ac6,0xba4c26796c582e4c,0x35d52e4f85db73e4,
  0x8ac3723b24e99436,0x4a2b6ce4b7a97a02,0xcb8017cc584b287d,0x1ca3610bc2f30e9f,0xc1c2dafdd385b283,
  0xa812778eceff9a2b,0x91b8429959ef5359,0xa2750c665bcab7d2,0x9212f5d704b5320b,0xfa46bb7a213be57f,
  0xd20cbd122dce6c1d,0x82868b5aee7a4776,0xf49ec5ddf8cec096,0xa4fc2bf71ac9dcc2,0x9d8b8f462bd2f17b,
  0x452703fe91008332,0x919a288ada854bef,0x75d2b2eb0f4eeed7,0xd64885293558a96f,0x098d7efb4f8d5b31,
  0x7ee77eef93a3928e,0xb28eebae28b63dc8,0x0f01129fc90af970,0xf3d5b92900d45181,0xb9d8a408ea6715c0,
  0xe44424fb8ca9e22e,0xd81135834c1aaf96,0x445b3d67398e888b,0x0dad43784fe36cda,0xe6d1bd75c5d81518,
  0x662f0e924150c5cb,0x78179f80df6e0709,0xdd8fc687a741289c,0x710873d7f5ab060e,0xa1961d2b538f497c,
  0xb36bbf75bc8b8761,0x675c608353017307,0xade6b1aa0ec59bbe,0xc803a2c9426b3c5f,0x48a8210409b5ffac,
  0xc3d58389ce5f3b13,0xa23ceb0e71b08443,0xd9d192cd9c5e9a05,0x20d9cd878b94147d,0x22329c7695f6df46,
  0xaebdcdc2c2cbc0d9,0xe95ae3d514f6f94b,0x59152e1f5715e782,0xb3280d75a8134f15,0x5bce3379e1fcb7b4,
  0x437d9c3238c4169f,0x77db7e5ebd5125bd,0x0dd3aef40336d438,0x4a496a56bac81428,0x72a128c3875dc93d,
  0x8eb605e5bef1747d,0x666d4546567a4eef,0xad5ad003399d2296,0x19c74366682b52a0,0xb3c35c5a0e259420,
  0xf98340503eb93d6d,0xa51985b0bb7f81e8,0x2a21510c6c7ca42f,0x3c1ac0b52c230998,0x4e1d572a2d77000b,
  0x8dd3adff3bfdec71,0xdfb3a4a23e43d035,0xe12f748421173e62,0x2f356145d2f72758,0x31c13682374c445c,
  0x09240a1f409fab88,0xa346e2d2f72fd5e8,0x2c5b53bfc05f9f77,0x0a9f7ab218574f6e,0xc3fcb9b977f0cceb,
  0xac26889eb86459b9,0x1082f785bc3dac21,0x3c8c337a4c67ef18,0x118e48d0e8a66e02,0xb777cef85278f2dc,
  0x12a268a3dcda05bc,0x75f5f7d3fde0bd9e,0x62f5f1650ec91670,0x81fcf9e3e1c3adec,0xf0b5e35ace23349c,
  0xde7d514d058e53a4,0x52a625e5f06242c7,0x3cc1346eda6a430a,0x165bd737e851f6a1,0xe52c53d745f1b49a,
  0x15513074f676fafc,0xcb8797dbb29e6710,0x27b92c8190fd679d,0x0b39384ac668b176,0x11341e6d7adad0e9,
  0x491b5b5390b70f94,0x1f5eccf586d03746,0x6502ca945646feae,0x3abb5466229ef7d8,0x535b4effbe0ce5f6,
  0x6575eefef9e916f5,0x77a76fbf3c76f2d7,0x1cc63124152994a7,0x6e33f80e95d4323d,0xd711791d9b2e1d65,
  0x7c766cd52013ae49,0x08bc15230d2ef477,0xb751fa3b942ab063,0xfe99a8b170a11941,0x731979294908218a,
  0x32166899c12f3097,0x8318df8e3823dd3d,0x940e81f0b4ece3d8,0x81ea0f12130235ea,0x36603dfef356d752,
  0x409eeb16b992d793,0xf4c675cca09e229a,0x0ef989d732dae818,0x269b4385573ad2f6,0x53df04584157173c,
  0x260c347bedc5ce82,0xb9fbfba9b58c1b09,0x20115df9d0693a14,0x8c0fb27588303369,0x3a9450974a66eaaf,
  0x805f0d515d715679,0x10f4b52a09898972,0x20e9c3449e84718e,0x9eed8745b4e234e2,0x946c3083bf840def,
  0xb18de02e626f7dd9,0x9e8b496b1d035ed8,0x6ef3891e7c690f77,0xd62269e5ad1c07f5,0x7117ed7eddc2883e,
  0x260f1d08457dfcca,0xe0759189d723da9d,0xd6d40adb9c9f94d7,0x7c47c4b4a670b77e,0xb2b5179563a2abe1,
  0x62118cb60f121507,0x22c3a4a74379ceb1,0xd5904c844fbfed74,0xa0afa38c06d50d92,0xd6223dbbcfcf73f4,
  0xf19623e7ec6f83dd,0xd08c12de2b6265f6,0xc487d5dc19489db6,0x759283ffd06fc796,0xd61a735ad1cd7ccc,
  0x32084ba3ca8fa3ee,0x17530308a1204968,0x80328582a1eb8d8f,0xd4c873deec7fb3d7,0x11c825cc4bc8b181,
  0x0137fa50576b21eb,0xc5ea2f958a3ddb53,0x6ae611d92b67c9bc,0xb798b3e1f9c3a851,0x22a42679fa4b013f,
  0x2071f22dae8de629,0x3faa3a80e45cbca6,0xb0418f45808009ec,0x446063013dd5a0f4,0x932445b680ef71ec,
  0x2bc9a2d9ab8e2662,0x8ebd57fbc56a6154,0xa28f3d2264ad0f10,0xffff84df76a10c15,0xac5c9b0e78fbee81,
  0xc1f08e08982b237c,0x5907b7fa41daa2b8,0xbed3856320d9c3c2,0x500a342c1902f015,0x0c3a5d539c71b7d6,
  0xa706750b1c3e5604,0x1543ab593a8c824c,0xbdfd9d26f151d83c,0x1603bb40537de208,0x1501b0ba802daa2d,
  0xdcbcc803f3c11f3c,0x2bb283a389ec2f35,0x3a27513ef9d14bf4,0xcb7c4fd02a39d8af,0xcc6f61a03488e43f,
  0xfdddf2b5fd6c4b05,0xa015987625b9755d,0x14c5a9b03c63b253,0x413f7d2608bf939e,0x8bdb68c7176407e5,
  0x436de64d8a614c32,0xc2aca4b10ff0bf8e,0x3b56cc9c1df797e4,0xb1750cce6cca57bb,0x8c80e2303509012a,
  0x7f25bae3c4fea8af,0xecf8ed9dac1367b8,0x1a49274e39668f4e,0xca4a0ae881c7dc39
};
```

## SMHasher Verification Value

The value is `0x1bdf358b`


## Possible Future Work

- Make a note about how internal state can be extended
- Implement a variable-output variant using a sponge construction

----------------

# *Beamsplitter*


