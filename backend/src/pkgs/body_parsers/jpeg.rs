use axum::{
    async_trait,
    body::Bytes,
    extract::{FromRequest, Multipart, Request},
    http::{header::CONTENT_TYPE, StatusCode},
};

////////////////////////////////////////////////////////////////////////////////

pub struct Jpeg {
    pub name: String,
    pub data: Bytes,
}

#[async_trait]
impl<S> FromRequest<S> for Jpeg
where
    Bytes: FromRequest<S>,
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let Some(content_type) = req.headers().get(CONTENT_TYPE) else {
            return Err(StatusCode::BAD_REQUEST);
        };

        if content_type == "multipart/form-data" {
            let mut multipart = Multipart::from_request(req, state)
                .await
                .map_err(|_| StatusCode::BAD_REQUEST)?;

            let Ok(Some(field)) = multipart.next_field().await else {
                return Err(StatusCode::BAD_REQUEST);
            };

            let name = field.name().unwrap().to_string();
            let bytes = field.bytes().await.map_err(|_| StatusCode::BAD_REQUEST)?;

            return Ok(Jpeg { name, data: bytes });
        } else if content_type == "image/jpeg" {
            let bytes = Bytes::from_request(req, state)
                .await
                .map_err(|_| StatusCode::BAD_REQUEST)?;

            return Ok(Jpeg {
                name: "image.jpg".to_string(),
                data: bytes,
            });
        }

        Err(StatusCode::BAD_REQUEST)
    }
}
