package org.yearup.models;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

public class OrderLineItem {
    private int orderLineItemId;
    private int orderId;
    private Product product;
    private BigDecimal salesPrice;
    private int quantity;
    private BigDecimal discount = BigDecimal.ZERO;

    public int getOrderLineItemId()
    {
        return orderLineItemId;
    }

    public void setOrderLineItemId(int orderLineItemId)
    {
        this.orderLineItemId = orderLineItemId;
    }

    public int getOrderId()
    {
        return orderId;
    }

    public void setOrderId(int orderId)
    {
        this.orderId = orderId;
    }

    public Product getProduct()
    {
        return product;
    }

    public void setProduct(Product product)
    {
        this.product = product;
    }

    @JsonIgnore
    public int getProductId()
    {
        return product != null ? product.getProductId() : 0;
    }

    public BigDecimal getSalesPrice()
    {
        return salesPrice;
    }

    public void setSalesPrice(BigDecimal salesPrice)
    {
        this.salesPrice = salesPrice;
    }

    public int getQuantity()
    {
        return quantity;
    }

    public void setQuantity(int quantity)
    {
        this.quantity = quantity;
    }

    public BigDecimal getDiscount()
    {
        return discount;
    }

    public void setDiscount(BigDecimal discount)
    {
        this.discount = discount;
    }

    public BigDecimal getLineTotal()
    {
        BigDecimal qty = new BigDecimal(quantity);
        return salesPrice.multiply(qty).subtract(discount);
    }
}
