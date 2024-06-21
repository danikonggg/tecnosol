const express = require ('express')
const routes = express.Router()


routes.get('/',(req,res)=>{
    req.getConnection((err,conn)=>{
        if(err)return res.send(err)

            conn.query('SELECT * FROM usuarios',(err,rows)=>{ 
                if(err)return res.send(err)

                    res.json(rows)
            })
    })
})

// Ruta para insertar un usuario
routes.post('/insertar_usuario', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err);

        // Obtener los datos del cuerpo de la solicitud
        const userData = req.body;

        // Agregar el campo privilegio con el valor 'No'
        userData.privilegio = 'No';

        // Ejecutar la consulta para insertar el usuario
        conn.query('INSERT INTO usuarios SET ?', [userData], (err, rows) => {
            if (err) return res.send(err);

            res.send('Usuario insertado');
        });
    });
});


routes.delete('/Perra', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.send(err);

        const { idusuario } = req.body;

        if (!idusuario) {
            return res.status(400).send('ID del usuario es necesario');
        }

        conn.query('DELETE FROM usuarios WHERE idusuario = ?', [idusuario], (err, rows) => {
            if (err) return res.send(err);

            res.send('Usuario eliminado');
        });
    });
});

// Ruta para la autenticación del usuario
routes.post('/login', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).json({ message: 'Error en el servidor' });

        // Imprimir en la consola lo que recibe de la aplicación
        console.log('Datos recibidos de la aplicación:', req.body);

        const { usuario, contraseña } = req.body;

        const query = `SELECT usuario, privilegio FROM usuarios WHERE usuario = ? AND contraseña = ?`;

        conn.query(query, [usuario, contraseña], (err, results) => {
            if (err) {
                console.error('Error en la consulta SQL:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            }

            const user = results[0];
            res.json({ message: 'Inicio de sesión exitoso', usuario: user.usuario, privilegio: user.privilegio });
        });
    });
});

// Endpoint para obtener los usuarios
routes.get('/usuarios',(req,res)=>{
    req.getConnection((err,conn)=>{
        if(err)return res.send(err)

            conn.query('SELECT * FROM usuarios',(err,rows)=>{ 
                if(err)return res.send(err)

                    res.json(rows)
            })
    })
});

routes.post('/insertar_datos_residencial', (req, res) => {
    const {
        pedido_param,
        fecha_param,
        asesor_param,
        contrato_pedido_param,
        folio_param,
        descripcion_param,
        baja_alta_presion_param,
        calentador_param,
        marca_param,
        modelo_param,
        no_termo_param,
        capacidad_termo_param,
        no_colector_param,
        tipo_colector_param,
        area_colector_param,
        calle_param,
        entre_calle1_param,
        entre_calle2_param,
        colonia_param,
        municipio_param,
        ciudad_param,
        estado_param,
        telefono_param,
        celular_param,
        nombre_param,
        apellido_paterno_param,
        apellido_materno_param,
        correo_param
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        // Inserción en la tabla pedido
        const queryPedido = 'INSERT INTO pedido (pedido, fecha, asesor, contrato_pedido, folio) VALUES (?, ?, ?, ?, ?)';
        conn.query(queryPedido, [pedido_param, fecha_param, asesor_param, contrato_pedido_param, folio_param], (err, resultPedido) => {
            if (err) {
                console.error('Error al insertar en la tabla pedido:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            // Obtener el ID del pedido insertado
            const pedido_id = resultPedido.insertId;

            // Inserción en la tabla residencial
            const queryResidencial = 'INSERT INTO residencial (pedido_idpedido, descripcion, baja_alta_presion, calentador, marca, modelo, no_termo, capacidad_termo, no_colector, tipo_colector, area_colector) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            conn.query(queryResidencial, [pedido_id, descripcion_param, baja_alta_presion_param, calentador_param, marca_param, modelo_param, no_termo_param, capacidad_termo_param, no_colector_param, tipo_colector_param, area_colector_param], (err, resultResidencial) => {
                if (err) {
                    console.error('Error al insertar en la tabla residencial:', err);
                    return res.status(500).json({ message: 'Error en el servidor' });
                }

                // Inserción en la tabla ubicacion
                const queryUbicacion = 'INSERT INTO ubicacion (pedido_idpedido, calle, entre_calle1, entre_calle2, colonia, municipio, ciudad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                conn.query(queryUbicacion, [pedido_id, calle_param, entre_calle1_param, entre_calle2_param, colonia_param, municipio_param, ciudad_param, estado_param], (err, resultUbicacion) => {
                    if (err) {
                        console.error('Error al insertar en la tabla ubicacion:', err);
                        return res.status(500).json({ message: 'Error en el servidor' });
                    }

                    // Inserción en la tabla cliente
                    const queryCliente = 'INSERT INTO cliente (pedido_idpedido, telefono, celular, nombre, apellido_paterno, apellido_materno, correo) VALUES (?, ?, ?, ?, ?, ?, ?)';
                    conn.query(queryCliente, [pedido_id, telefono_param, celular_param, nombre_param, apellido_paterno_param, apellido_materno_param, correo_param], (err, resultCliente) => {
                        if (err) {
                            console.error('Error al insertar en la tabla cliente:', err);
                            return res.status(500).json({ message: 'Error en el servidor' });
                        }

                        // Finalizar con éxito
                        res.json({ message: 'Inserción exitosa' });
                    });
                });
            });
        });
    });
});

//obtener datos de la tabla de resiudencial
routes.get('/obtener_datos_residencial', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        const query = `
            SELECT 
                p.idpedido, p.pedido, p.fecha, p.asesor, p.contrato_pedido, p.folio,
                r.descripcion, r.baja_alta_presion, r.calentador, r.marca, r.modelo, 
                r.no_termo, r.capacidad_termo, r.no_colector, r.tipo_colector, r.area_colector,
                u.calle, u.entre_calle1, u.entre_calle2, u.colonia, u.municipio, 
                u.ciudad, u.estado,
                c.telefono, c.celular, c.nombre, c.apellido_paterno, c.apellido_materno, c.correo
            FROM pedido p
            JOIN residencial r ON p.idpedido = r.pedido_idpedido
            JOIN ubicacion u ON p.idpedido = u.pedido_idpedido
            JOIN cliente c ON p.idpedido = c.pedido_idpedido
        `;

        conn.query(query, (err, results) => {
            if (err) {
                console.error('Error en la consulta SQL:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            res.json(results); // Enviar resultados como respuesta JSON
        });
    });
});

//select de tabla modelo 
routes.get('/modelos',(req,res)=>{
    req.getConnection((err,conn)=>{
        if(err)return res.send(err)

            conn.query('SELECT * FROM modelo',(err,rows)=>{ 
                if(err)return res.send(err)

                    res.json(rows)
            })
    })
});

// Eliminar un pedido por ID
routes.delete('/eliminar_pedido/:id', (req, res) => {
    const { id } = req.params;
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        const query = 'DELETE FROM pedido WHERE idpedido = ?';

        conn.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error en la consulta SQL:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            res.json({ message: 'Pedido eliminado correctamente' });
        });
    });
});
//ruta editaar pedido residencial
routes.put('/editar_pedido/:id', (req, res) => {
    const { id } = req.params;
    const {
        pedido_param,
        fecha_param,
        asesor_param,
        contrato_pedido_param,
        folio_param,
        descripcion_param,
        baja_alta_presion_param,
        calentador_param,
        marca_param,
        modelo_param,
        no_termo_param,
        capacidad_termo_param,
        no_colector_param,
        tipo_colector_param,
        area_colector_param,
        calle_param,
        entre_calle1_param,
        entre_calle2_param,
        colonia_param,
        municipio_param,
        ciudad_param,
        estado_param,
        telefono_param,
        celular_param,
        nombre_param,
        apellido_paterno_param,
        apellido_materno_param,
        correo_param
    } = req.body;

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        // Actualizar la tabla pedido
        const queryPedido = 'UPDATE pedido SET pedido = ?, fecha = ?, asesor = ?, contrato_pedido = ?, folio = ? WHERE idpedido = ?';
        conn.query(queryPedido, [pedido_param, fecha_param, asesor_param, contrato_pedido_param, folio_param, id], (err, resultPedido) => {
            if (err) {
                console.error('Error al actualizar en la tabla pedido:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            // Actualizar la tabla residencial
            const queryResidencial = 'UPDATE residencial SET descripcion = ?, baja_alta_presion = ?, calentador = ?, marca = ?, modelo = ?, no_termo = ?, capacidad_termo = ?, no_colector = ?, tipo_colector = ?, area_colector = ? WHERE pedido_idpedido = ?';
            conn.query(queryResidencial, [descripcion_param, baja_alta_presion_param, calentador_param, marca_param, modelo_param, no_termo_param, capacidad_termo_param, no_colector_param, tipo_colector_param, area_colector_param, id], (err, resultResidencial) => {
                if (err) {
                    console.error('Error al actualizar en la tabla residencial:', err);
                    return res.status(500).json({ message: 'Error en el servidor' });
                }

                // Actualizar la tabla ubicacion
                const queryUbicacion = 'UPDATE ubicacion SET calle = ?, entre_calle1 = ?, entre_calle2 = ?, colonia = ?, municipio = ?, ciudad = ?, estado = ? WHERE pedido_idpedido = ?';
                conn.query(queryUbicacion, [calle_param, entre_calle1_param, entre_calle2_param, colonia_param, municipio_param, ciudad_param, estado_param, id], (err, resultUbicacion) => {
                    if (err) {
                        console.error('Error al actualizar en la tabla ubicacion:', err);
                        return res.status(500).json({ message: 'Error en el servidor' });
                    }

                    // Actualizar la tabla cliente
                    const queryCliente = 'UPDATE cliente SET telefono = ?, celular = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ?, correo = ? WHERE pedido_idpedido = ?';
                    conn.query(queryCliente, [telefono_param, celular_param, nombre_param, apellido_paterno_param, apellido_materno_param, correo_param, id], (err, resultCliente) => {
                        if (err) {
                            console.error('Error al actualizar en la tabla cliente:', err);
                            return res.status(500).json({ message: 'Error en el servidor' });
                        }

                        // Finalizar con éxito
                        res.json({ message: 'Pedido actualizado correctamente' });
                    });
                });
            });
        });
    });
});

//ruta eliminar residencial
routes.delete('/eliminar_pedido/:id', (req, res) => {
    const { id } = req.params;

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        // Eliminar de la tabla cliente
        const queryCliente = 'DELETE FROM cliente WHERE pedido_idpedido = ?';
        conn.query(queryCliente, [id], (err, resultCliente) => {
            if (err) {
                console.error('Error al eliminar en la tabla cliente:', err);
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            // Eliminar de la tabla ubicacion
            const queryUbicacion = 'DELETE FROM ubicacion WHERE pedido_idpedido = ?';
            conn.query(queryUbicacion, [id], (err, resultUbicacion) => {
                if (err) {
                    console.error('Error al eliminar en la tabla ubicacion:', err);
                    return res.status(500).json({ message: 'Error en el servidor' });
                }

                // Eliminar de la tabla residencial
                const queryResidencial = 'DELETE FROM residencial WHERE pedido_idpedido = ?';
                conn.query(queryResidencial, [id], (err, resultResidencial) => {
                    if (err) {
                        console.error('Error al eliminar en la tabla residencial:', err);
                        return res.status(500).json({ message: 'Error en el servidor' });
                    }

                    // Eliminar de la tabla pedido
                    const queryPedido = 'DELETE FROM pedido WHERE idpedido = ?';
                    conn.query(queryPedido, [id], (err, resultPedido) => {
                        if (err) {
                            console.error('Error al eliminar en la tabla pedido:', err);
                            return res.status(500).json({ message: 'Error en el servidor' });
                        }

                        // Finalizar con éxito
                        res.json({ message: 'Pedido eliminado correctamente' });
                    });
                });
            });
        });
    });
});


module.exports = routes