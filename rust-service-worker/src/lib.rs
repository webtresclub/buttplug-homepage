use wasm_bindgen::prelude::*;

use hex::encode as hex_encode; // Added for hex encoding
use hex::decode as hex_decode;//

use rand::Rng;

use fawkes_crypto_keccak256::native::hash::keccak256;

// This macro allows the function to be called from JavaScript.
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub struct Results {
    nonce: String,
    hash: String,
}

#[wasm_bindgen]
impl Results {
    #[wasm_bindgen(getter)]
    pub fn nonce(&self) -> String {
        self.nonce.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn hash(&self) -> String {
        self.hash.clone()
    }

    // You may also want to provide a constructor for `Results`
    pub fn new(nonce: String, hash: String) -> Results {
        Results { nonce, hash }
    }
}

// This macro allows the function to be called from JavaScript.
 #[wasm_bindgen]
pub fn crack(user_str: String, current_salt_str: String, difficulty: usize) -> Results {
    // let user = hex_decode("6CA6d1e2D5347Bfab1d91e883F1915560e09129D").unwrap();
    let user = hex_decode(user_str).unwrap();
    assert_eq!(user.len(), 20, "User length should be 20");
    
    // let current_salt = hex_decode("851e34d5f1de39b1758b00f0040ae4ab4f3bc8c5631b4a8463144022de2cf428").unwrap();
    let current_salt = hex_decode(current_salt_str).unwrap();
    assert_eq!(current_salt.len(), 32, "Salt length should be 32");
    
    let mut rng = rand::thread_rng();

    let mut _n = vec![0u8; 32]; // Create random nonce
    rng.fill(&mut _n[..]);

    let mut encoded_with_nonce = user.clone();
    encoded_with_nonce.extend_from_slice(&current_salt); // Append the salt bytes directly
    let base_len = encoded_with_nonce.len();
    encoded_with_nonce.extend_from_slice(&_n); // Append the nonce bytes directly
    
    for i in 0..1_000_000 {            
        let nonce_index = base_len + (i % 32);
        encoded_with_nonce[nonce_index] = rng.gen_range(0..=255);
        
        let salt = keccak256(&encoded_with_nonce);
        if leading_zeros(&salt, difficulty) {
            // println!("seed: 0x{:}", hex_encode(&encoded_with_nonce[base_len..].to_vec()));
            // println!("hash output: 0x{:}", hex_encode(&salt.to_vec()));
            let nonce = hex_encode(&encoded_with_nonce[base_len..].to_vec()).to_string();
            let hash = hex_encode(&salt.to_vec()).to_string();

            return Results { nonce, hash }
        }    
    }


    Results { hash: "".to_string(), nonce: "".to_string() }
}

fn leading_zeros(hash: &[u8], difficulty: usize) -> bool {
    // Calculate the number of full zero bytes required
    let full_zero_bytes = difficulty / 2;
 
    // Check each full zero byte
    for &byte in hash.iter().take(full_zero_bytes) {
        if byte != 0 {
            return false;
        }
    }

    // If n is odd, check the next half byte (4 bits) for zeros
    // Note: No need to check if full_zero_bytes is within bounds again, as it's implied by earlier return
    if difficulty % 2 != 0 && (hash.get(full_zero_bytes).unwrap_or(&0) & 0xF0) != 0 {
        return false;
    }

    true
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        // let result = add(2, 2);
        let result = 4;
        assert_eq!(result, 4);
    }
}
