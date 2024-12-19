use axum::{
    body::Body,
    extract::{Path, State},
    http::{header, HeaderMap},
    response::IntoResponse,
};

use super::state::CtrlState;
use crate::pkgs::common::ApiResult;
use crate::pkgs::ctx::Ctx;
use crate::pkgs::errors::{ApiError, Error};

use crate::info;

use tokio_util::io::ReaderStream;

////////////////////////////////////////////////////////////////////////////////
// https://github.com/tokio-rs/axum/discussions/608
// https://www.reddit.com/r/rust/comments/1bqsyge/axum_074_what_happened_to_streambody/

#[axum::debug_handler]
pub async fn get_asset_v1(
    ctx: Ctx,
    State(state): State<CtrlState>,
    Path(file_name): Path<String>,
) -> ApiResult<impl IntoResponse> {
    info!("get_asset_v1 - {:?}", ctx);

    let full_file_name = state.default_dest + "/" + &file_name;
    let file = match tokio::fs::File::open(full_file_name).await {
        Ok(file) => file,
        Err(err) => {
            info!("get_asset_v1 - {:?}", err);
            return Err(ApiError {
                error: Error::FileNotFound { source: file_name },
                req_id: ctx.req_id(),
            });
        }
    };

    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);

    let mut headers = HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        "image/jpeg; charset=utf-8".parse().unwrap(),
    );
    headers.insert(
        header::CONTENT_DISPOSITION,
        format!("attachment; filename=\"{}\"", file_name)
            .parse()
            .unwrap(),
    );

    Ok((headers, body))
}
