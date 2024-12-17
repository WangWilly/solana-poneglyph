use std::str::FromStr;

use anchor_client::solana_sdk::pubkey::Pubkey;

////////////////////////////////////////////////////////////////////////////////

pub fn get_mpl_core_id() -> Pubkey {
    Pubkey::from_str("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d").unwrap()
}

pub fn get_ticket_contract_id() -> Pubkey {
    Pubkey::from_str("B28UKH17RsMkqA9n3YbviRMny9yeiBdM7pzjT9LK1JZ").unwrap()
}

pub fn get_life_helper_id() -> Pubkey {
    Pubkey::from_str("6wpG1R1Sc7hJf6ZzAzMuzuhSGCEdmuS6X7vgaBXPnqgc").unwrap()
}
