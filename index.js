var http = require('http');
var url = require('url');
var qs = require('querystring');
var db = require("./db"); // Pastikan file db.js Anda sudah benar
var port = 8080;

http.createServer(function (req, res) {
    var q = url.parse(req.url, true);
    var id = q.query.id; // Ambil id dari query parameter

    res.setHeader('Content-Type', 'application/json');

    // Routing berdasarkan pathname dan method
    if (q.pathname == "/products") {
        
        // READ (GET)
        if (req.method === "GET") {
            if (id) {
                // Get one product by ID
                let sql = "SELECT * FROM products WHERE id = ?";
                db.query(sql, [id], (err, result) => {
                    if (err) {
                        res.writeHead(500); // Internal Server Error
                        return res.end(JSON.stringify({ message: "Database Error", error: err }));
                    }

                    if (result.length === 0) {
                        res.writeHead(404); // Not Found
                        return res.end(JSON.stringify({ message: "Product not found" }));
                    }
                    
                    res.writeHead(200); // OK
                    res.end(JSON.stringify(result[0]));
                });
            } else {
                // Get all products
                let sql = "SELECT * FROM products";
                db.query(sql, (err, result) => {
                    if (err) {
                        res.writeHead(500);
                        return res.end(JSON.stringify({ message: "Database Error", error: err }));
                    }
                    res.writeHead(200);
                    res.end(JSON.stringify(result));
                });
            }
        }
        // CREATE (POST)
        else if (req.method === "POST") {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString(); // Mengumpulkan data dari body request
            });
            req.on('end', () => {
                try {
                    const product = JSON.parse(body);
                    if (!product.name || !product.price) {
                         res.writeHead(400); // Bad Request
                         return res.end(JSON.stringify({ message: "Name and price are required" }));
                    }
                    
                    let sql = "INSERT INTO products (name, price) VALUES (?, ?)";
                    let values = [product.name, product.price];
                    
                    db.query(sql, values, (err, result) => {
                        if (err) {
                            res.writeHead(500);
                            return res.end(JSON.stringify({ message: "Database Error", error: err }));
                        }
                        res.writeHead(201); // Created
                        res.end(JSON.stringify({ message: "Product created", insertId: result.insertId }));
                    });
                } catch (e) {
                    res.writeHead(400); // Bad Request
                    res.end(JSON.stringify({ message: "Invalid JSON", error: e.message }));
                }
            });
        }
        // UPDATE (PUT)
        else if (req.method === "PUT") {
            if (!id) {
                res.writeHead(400);
                return res.end(JSON.stringify({ message: "Product ID is required in query parameter" }));
            }

            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                 try {
                    const product = JSON.parse(body);
                    if (!product.name || !product.price) {
                         res.writeHead(400);
                         return res.end(JSON.stringify({ message: "Name and price are required" }));
                    }
                    
                    let sql = "UPDATE products SET name = ?, price = ? WHERE id = ?";
                    let values = [product.name, product.price, id];
                    
                    db.query(sql, values, (err, result) => {
                        if (err) {
                            res.writeHead(500);
                            return res.end(JSON.stringify({ message: "Database Error", error: err }));
                        }
                        if (result.affectedRows === 0) {
                             res.writeHead(404);
                             return res.end(JSON.stringify({ message: "Product not found" }));
                        }
                        res.writeHead(200);
                        res.end(JSON.stringify({ message: `Product with ID ${id} updated` }));
                    });
                 } catch (e) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: "Invalid JSON", error: e.message }));
                 }
            });
        }
        // DELETE
        else if (req.method === "DELETE") {
            if (!id) {
                res.writeHead(400);
                return res.end(JSON.stringify({ message: "Product ID is required in query parameter" }));
            }

            let sql = "DELETE FROM products WHERE id = ?";
            db.query(sql, [id], (err, result) => {
                if (err) {
                    res.writeHead(500);
                    return res.end(JSON.stringify({ message: "Database Error", error: err }));
                }
                 if (result.affectedRows === 0) {
                     res.writeHead(404);
                     return res.end(JSON.stringify({ message: "Product not found" }));
                }
                res.writeHead(200);
                res.end(JSON.stringify({ message: `Product with ID ${id} deleted` }));
            });
        }
    } else {
        // Jika path tidak ditemukan
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Route not found" }));
    }

}).listen(port);
console.log('Server is running on http://localhost:' + port);