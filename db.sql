CREATE TABLE users_revenue (
    user_id Varchar(30) PRIMARY KEY,
    revenue NUMERIC DEFAULT 0
);


/* a function that creates ot updates a user's revenue */ 
CREATE OR REPLACE FUNCTION update_revenue(
    p_user_id Varchar(30),
    p_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
    -- Check if the user exists and locks the row
    IF EXISTS (SELECT 1 FROM users_revenue WHERE user_id = p_user_id FOR UPDATE) THEN
        -- Update the revenue if the user exists
        UPDATE users_revenue
        SET revenue = revenue + p_amount
        WHERE user_id = p_user_id;
    ELSE
        -- Insert a new row if the user does not exist
        INSERT INTO users_revenue (user_id, revenue)
        VALUES (p_user_id, p_amount);
    END IF;
END;
$$ LANGUAGE plpgsql;
