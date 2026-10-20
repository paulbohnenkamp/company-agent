from __future__ import annotations

import os
from typing import Annotated
from urllib.parse import quote

import httpx
import uvicorn
from fastmcp import FastMCP
from pydantic import BaseModel, ConfigDict, Field, StrictStr, ValidationError
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send


class Customer(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    id: StrictStr
    name: StrictStr
    status: StrictStr
    openRequestCount: int


CustomerId = Annotated[str, Field(description="Customer ID such as CUST-1001.")]

mcp = FastMCP("customer-mcp", version="0.1.0")


async def fetch_customer(customer_id: str) -> Customer:
    api_url = os.getenv("CUSTOMER_API_URL", "http://localhost:5080").rstrip("/")
    url = f"{api_url}/api/customers/{quote(customer_id, safe='')}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
    if not response.is_success:
        raise CustomerLookupError(response.status_code)

    try:
        return Customer.model_validate(response.json())
    except (TypeError, ValueError, ValidationError) as error:
        raise ValueError("Customer API returned an invalid customer payload") from error


class CustomerLookupError(Exception):
    def __init__(self, status_code: int) -> None:
        self.status_code = status_code
        super().__init__(f"Customer lookup failed with HTTP {status_code}.")


async def lookup_customer(customer_id: str, summary: bool) -> str:
    if not isinstance(customer_id, str) or len(customer_id) == 0:
        raise ValueError("customerId is required")

    try:
        customer = await fetch_customer(customer_id)
    except CustomerLookupError as error:
        raise RuntimeError(str(error)) from error

    if summary:
        return (
            f"{customer.name} ({customer.id}) is {customer.status} "
            f"with {customer.openRequestCount} open request(s)."
        )
    return customer.model_dump_json()


@mcp.tool
async def find_customer(customerId: CustomerId) -> str:
    """Find a customer by the exact customer ID in the existing customer application."""
    return await lookup_customer(customerId, summary=False)


@mcp.tool
async def get_customer_summary(customerId: CustomerId) -> str:
    """Retrieve a read-only customer account summary from the existing customer application."""
    return await lookup_customer(customerId, summary=True)


@mcp.custom_route("/health", methods=["GET"])
async def health(request: Request) -> JSONResponse:
    return JSONResponse({"status": "ok", "service": "customer-mcp"})


class RootAlias:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http" and scope["path"] == "/":
            scope = dict(scope)
            scope["path"] = "/mcp"
            scope["raw_path"] = b"/mcp"
        await self.app(scope, receive, send)


app = RootAlias(mcp.http_app(stateless_http=True))


def main() -> None:
    if os.getenv("MCP_TRANSPORT", "stdio") == "http":
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=int(os.getenv("PORT", "3000")),
        )
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
