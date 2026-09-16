from app.services.sql.safety import validate_and_prepare


ALLOWED = {"customers", "orders", "regions", "products", "order_items"}


def test_select_is_allowed():
    result = validate_and_prepare(
        "SELECT name FROM customers",
        ALLOWED,
        100,
    )
    assert result.valid
    assert "LIMIT 100" in result.sql.upper()


def test_delete_is_rejected():
    result = validate_and_prepare(
        "DELETE FROM customers",
        ALLOWED,
        100,
    )
    assert not result.valid


def test_unknown_table_is_rejected():
    result = validate_and_prepare(
        "SELECT * FROM secrets",
        ALLOWED,
        100,
    )
    assert not result.valid


def test_multiple_statements_are_rejected():
    result = validate_and_prepare(
        "SELECT * FROM customers; DELETE FROM customers;",
        ALLOWED,
        100,
    )
    assert not result.valid
