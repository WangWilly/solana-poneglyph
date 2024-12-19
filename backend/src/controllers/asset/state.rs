// use crate::pkgs::db_helper::DbPool;

////////////////////////////////////////////////////////////////////////////////

#[derive(Clone)]
pub struct CtrlState {
    // db: DbPool,
    pub default_dest: String,
}

////////////////////////////////////////////////////////////////////////////////

pub fn get_default_dest() -> String {
    let default_dest =
        std::env::var("ASSET_CTRL_DEFAULT_DEST").expect("ASSET_CTRL_DEFAULT_DEST is not set");

    default_dest
}
