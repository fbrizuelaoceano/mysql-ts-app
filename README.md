# mysql-ts-app
ZohoCRMNodeJS

Proyecto de integracion Zoho CRM a backend en nodeJS. 

Tiene un get contacts, get contact by id, y un insert contact. 

Cuando el proyecto transpila typescript se borran los token deacceso, entonces la primer consulta que se haga no va a tener acceso pero lo va solicitar y renovar, entonces para la segunda llamada que se haga vas a tener los datos desde zohocrm autorizados.
