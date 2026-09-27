export function successResponse(res, data, message = "Success") {
  return res.status(200).json({
    success: true,
    message,
    data
  });
}

export function createdResponse(res, data, message = "Created successfully") {
  return res.status(201).json({
    success: true,
    message,
    data
  });
}

export function errorResponse(
  res,
  message = "Something went wrong",
  status = 400
) {
  return res.status(status).json({
    success: false,
    message
  });
}