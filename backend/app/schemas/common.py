def ok(data, meta=None):
    return {"success": True, "data": data, "meta": meta or {}}


def err(error_code: str, message: str, details=None, trace_id=None):
    return {
        "success": False,
        "error_code": error_code,
        "message": message,
        "details": details or {},
        "trace_id": trace_id or "n/a"
    }
