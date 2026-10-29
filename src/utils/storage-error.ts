/** Error de Supabase Storage por un tipo MIME no permitido en el bucket. */
export function isUnsupportedMimeTypeError(error: {
  message?: string;
  statusCode?: string | number;
}): boolean {
  const status = String(error.statusCode ?? "");
  return (
    status === "415" ||
    /mime type .* is not supported/i.test(error.message ?? "")
  );
}
