const STATE = 32;
const STATE64 = STATE >> 3;
const STATEM = STATE-1;
const BSTATEM = (STATEM);
const HSTATE64M = (STATE64 >> 1)-1;
const STATE64M = STATE64-1;
const disco_buf = new ArrayBuffer(STATE);
const MASK = 0xffffffffffffff;
const state8 = new Uint8Array(disco_buf);
const state32 = new Uint32Array(disco_buf);
const state = new BigUint64Array(disco_buf);
const C = new BigUint64Array(1);
const C8 = new Uint8Array(1);
const T64 = new BigUint64Array(2);
const T8 = new Uint8Array(2);
const R = 23n;
const S3 = 63n;
const S4 = 64n;

function rot( v, n = 0n ) {
	n = n & S3;
	if (n) {
		v = (v >> n) | (v << (S4-n));
	}
	return v; 
}

function rot8( v, n = 0 ) {
	n = n & 7;
	if (n) {
		v = (v >> n) | (v << (8-n));
	}
	return v; 
}

function mix(A = 0) {
  const B = A+1;
  const iv = state[A] & 1023;
  T64[0] = T[iv] + state[A];
  state[B] += T64[0];

  state[A] ^= state[B];
  state[B] ^= state[A];
  state[A] ^= state[B];

  state[B] = rot(state[B], state[A]);
}

function round( m64, m8, len ) {
  //console.log(`rstate0 = 0x${state[0].toString(16).padStart(16,'0')} 0x${state[1].toString(16).padStart(16,'0')} 0x${state[2].toString(16).padStart(16,'0')} 0x${state[3].toString(16).padStart(16,'0')}`);
	let index = 0;
	let sindex = 0;
	C[0] = 0xfaccadaccad09997n;
  C8[0] = 137;

	for( let Len = len >> 3; index < Len; index++) {
		T64[0] = m64[index] + BigInt(index) + 1n;
    T64[1] = state[sindex] + BigInt(index) + 1n;
    T64[0] = rot(T64[0], T64[1]);
    //console.log(`rstate1 = 0x${state[0].toString(16).padStart(16,'0')} 0x${state[1].toString(16).padStart(16,'0')} 0x${state[2].toString(16).padStart(16,'0')} 0x${state[3].toString(16).padStart(16,'0')}`);
    state[sindex] += T64[0];
		if ( sindex == HSTATE64M ) {
			mix(0);
		} else if ( sindex == STATE64M ) {
			mix(2);
			sindex = -1;
		}
		sindex++;
    //console.log(`rstate2 = 0x${state[0].toString(16).padStart(16,'0')} 0x${state[1].toString(16).padStart(16,'0')} 0x${state[2].toString(16).padStart(16,'0')} 0x${state[3].toString(16).padStart(16,'0')}`);
	}

	mix(1);

	index <<= 3;
	sindex = index&(BSTATEM);
  //console.log(`rstate3 = 0x${state[0].toString(16).padStart(16,'0')} 0x${state[1].toString(16).padStart(16,'0')} 0x${state[2].toString(16).padStart(16,'0')} 0x${state[3].toString(16).padStart(16,'0')}`);
  //console.log(index,len);
	for( ; index < len; index++) {
		T8[0] = m8[index] + index + 1;
    T8[1] = state8[sindex] + index + 1;
    T8[0] = rot8(T8[0], T8[1]);
    state8[sindex] += T8[0];
    //console.log(`rstate4 = 0x${state[0].toString(16).padStart(16,'0')} 0x${state[1].toString(16).padStart(16,'0')} 0x${state[2].toString(16).padStart(16,'0')} 0x${state[3].toString(16).padStart(16,'0')}`);
		mix(index%STATE64M);
		if ( sindex >= BSTATEM ) {
			sindex = -1;
		}
		sindex++;
    //console.log(`rstate5 = 0x${state[0].toString(16).padStart(16,'0')} 0x${state[1].toString(16).padStart(16,'0')} 0x${state[2].toString(16).padStart(16,'0')} 0x${state[3].toString(16).padStart(16,'0')}`);
	}

	mix(0);
	mix(1);
	mix(2);
  //console.log(`rstate6 = 0x${state[0].toString(16).padStart(16,'0')} 0x${state[1].toString(16).padStart(16,'0')} 0x${state[2].toString(16).padStart(16,'0')} 0x${state[3].toString(16).padStart(16,'0')}`);
}

export function beamsplitter( key = '', seed = 0 ) {
  // get 32-bit codepoints if it's a string
    // ref: "I say we take take-off, nuke the site from orbit, only way to be sure"

  let wasString = false;
  let len = key.length;
  if ( typeof key == "string" ) {
    const Key = [];
    for( const k of key ) {
      Key.push(k.codePointAt(0));
    }
    key = Key;
    len = key.length*4;
    if( len % 8 != 0 ) {
      len += 4;
    }
    wasString = true;
  }

  const blen = len + (8-(len%8))%8;
  //console.log(JSON.stringify(Array.from(key)), seed, len, blen);
  const key_buf = new ArrayBuffer(blen);
  const key8Arr = new Uint8Array(key_buf);
  const key32Arr = new Uint32Array(key_buf);
  const key64Arr = new BigUint64Array(key_buf);

  if ( wasString ) {
    key32Arr.set(key);
  } else {
    key8Arr.set(key);
  }

  const seed_buf = new ArrayBuffer(8);
  const seed8Arr = new Uint8Array(seed_buf);
  const seed32Arr = new Uint32Array(seed_buf);
  const seed64Arr = new BigUint64Array(seed_buf);

  seed32Arr[0] = 0xc5550690;
  seed32Arr[0] -= seed;
  seed32Arr[1] = 1 - seed;
  seed32Arr[1] = ~seed32Arr[2];

  // nothing up my sleeve
  state[0] = 0x123456789abcdef0n;
  state[1] = 0x0fedcba987654321n;
  state[2] = 0xaccadacca80081e5n;
  state[3] = 0xf00baaf00f00baaan;

  //console.log(`state = 0x${state[0].toString(16).padStart(16,'0')} 0x${state[1].toString(16).padStart(16,'0')} 0x${state[2].toString(16).padStart(16,'0')} 0x${state[3].toString(16).padStart(16,'0')}`);

  round( key64Arr, key8Arr, len );
  round( key64Arr, key8Arr, len );
  round( key64Arr, key8Arr, len );
  round( seed64Arr, seed8Arr, 8 );
  //round( state, state8, STATE   );
  round( seed64Arr, seed8Arr, 8 );
  round( key64Arr, key8Arr, len );
  round( key64Arr, key8Arr, len );
  round( key64Arr, key8Arr, len );

  /**
  console.log(`state = ${state[0]} ${state[1]} ${state[2]} ${state[3]}\n`);
  **/

  const output = new ArrayBuffer(STATE);
  const h = new BigUint64Array(output);

  h[0] = state[2];
  h[1] = state[3];

  h[0] += h[1];

  return h[0];
}
