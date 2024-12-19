// TODO: https://www.reddit.com/r/learnrust/comments/14qb2mh/how_can_i_post_big_files_with_axum/
// https://github.com/tokio-rs/axum/blob/96e071c8fba443ed3bebcee5320da32b46bf4a59/examples/stream-to-file/src/main.rs#L103
// https://github.com/tokio-rs/axum/discussions/1638
// https://medium.com/intelliconnect-engineering/uploading-files-to-aws-s3-using-axum-a-rust-framework-c96b1c774dfc
// https://users.rust-lang.org/t/axum-post-handler-that-accepts-multipart-and-image-jpeg/113182
mod create_v1;
pub mod ctrl;
mod dtos;
mod get_v1;
pub mod state;
