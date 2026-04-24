package org.yearup.data.mysql;

import org.springframework.stereotype.Component;
import org.yearup.data.ShoppingCartDao;
import org.yearup.models.Product;
import org.yearup.models.ShoppingCart;
import org.yearup.models.ShoppingCartItem;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Component
public class MySqlShoppingCartDao extends MySqlDaoBase implements ShoppingCartDao {

    public MySqlShoppingCartDao(DataSource dataSource){
        super(dataSource);
    }

    @Override
    public ShoppingCart getByUserId(int userId){
        ShoppingCart cart = new ShoppingCart();
        String sql = """
                SELECT p.product_id,
                       p.name,
                       p.description,
                       p.price,
                       p.category_id,
                       p.subcategory,
                       p.stock,
                       p.image_url,
                       p.featured,
                       sc.quantity
                  FROM shopping_cart sc
                  JOIN products p ON sc.product_id = p.product_id
                 WHERE sc.user_id = ?
                """;

        try(Connection connection = getConnection();
            PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1,userId);
            try(ResultSet rs = statement.executeQuery()){
                while(rs.next()){
                    Product product = new Product();
                    product.setProductId(rs.getInt("product_id"));
                    product.setName(rs.getString("name"));
                    product.setDescription(rs.getString("description"));
                    product.setPrice(rs.getBigDecimal("price"));
                    product.setCategoryId(rs.getInt("category_id"));
                    product.setSubCategory(rs.getString("subCategory"));
                    product.setStock(rs.getInt("stock"));
                    product.setImageUrl(rs.getString("image_url"));
                    product.setFeatured(rs.getBoolean("featured"));

                    //Build cart item
                    ShoppingCartItem item = new ShoppingCartItem();
                    item.setProduct(product);
                    item.setQuantity(rs.getInt("quantity"));

                    //Add to cart
                    cart.add(item);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return cart;
    }

    @Override
    public void addProduct(int userId, int productId){
        String sql = """
        INSERT INTO shopping_cart (user_id, product_id, quantity)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE quantity = quantity + 1
        """;

        try(Connection connection = getConnection();
        PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1,userId);
            statement.setInt(2,productId);
            statement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void updateProduct(int userId, int productId, int quantity){
        if(quantity <=0){
            String deleteSql = "DELETE FROM shopping_cart WHERE user_id = ? AND product_id = ? ";
            try (Connection connection = getConnection();
                 PreparedStatement statement = connection.prepareStatement(deleteSql))
            {
                statement.setInt(1, userId);
                statement.setInt(2, productId);
                statement.executeUpdate();
            }
            catch (SQLException e)
            {
                throw new RuntimeException(e);
            }
        }
        String sql = "UPDATE shopping_cart SET quantity = ? WHERE user_id = ? AND product_id = ?";
        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql))
        {
            statement.setInt(1, quantity);
            statement.setInt(2, userId);
            statement.setInt(3, productId);
            statement.executeUpdate();
        }
        catch (SQLException e)
        {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void clearCart(int userId){
        String sql = "DELETE FROM shopping_cart WHERE user_id = ?";
        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql))
        {
            statement.setInt(1, userId);
            statement.executeUpdate();
        }
        catch (SQLException e)
        {
            throw new RuntimeException(e);
        }
    }
}
