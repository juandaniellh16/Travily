package es.agrobitacora.dao;

import java.util.List;

import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.Transaction;

public class EventoDAO {
    public void addEvento(Evento bean){
        Session session = SessionUtil.getSession();        
        Transaction tx = session.beginTransaction();
        addEvento(session,bean);        
        tx.commit();
        session.close();
        
    }
    
    private void addEvento(Session session, Evento bean){
        Evento Evento = new Evento();
        
        Evento.setDetalles(bean.getDetalles());
        Evento.setFecha(bean.getFecha());
        Evento.setFin(bean.getFin());
        Evento.setInicio(bean.getInicio());
        Evento.setNombre(bean.getNombre());
        Evento.setResponsables(bean.getResponsables());
        
        session.save(Evento);
    }
    
    public List<Evento> getEventos(){
        Session session = SessionUtil.getSession();    
        Query query = session.createQuery("from Evento");
        List<Evento> Eventos =  query.list();
        session.close();
        return Eventos;
    }
    
    public Evento getEvento(int id){
        Session session = SessionUtil.getSession();
        String hql = "from Evento where id = :id";
        Query query = session.createQuery(hql);
        query.setInteger("id",id);        
        Evento ev =  (Evento) query.uniqueResult();
        session.close();
        return ev;
    }

 
    public int deleteEvento(int id) {
        Session session = SessionUtil.getSession();
        Transaction tx = session.beginTransaction();
        String hql = "delete from Evento where id = :id";
        Query query = session.createQuery(hql);
        query.setInteger("id",id);
        int rowCount = query.executeUpdate();
        System.out.println("Rows affected: " + rowCount);
        tx.commit();
        session.close();
        return rowCount;
    }
    
    public int updateEvento(int id, Evento emp){
         if(id <=0)  
               return 0;  
         Session session = SessionUtil.getSession();
            Transaction tx = session.beginTransaction();
            String hql = "update Evento set nombre = :nombre, fecha=:fecha, inicio=:inicio, fin=:fin, responsables=:responsables, detalles=:detalles where id = :id";
            Query query = session.createQuery(hql);
            query.setInteger("id",id);
            query.setString("nombre",emp.getNombre());
            query.setString("responsables",emp.getResponsables());
            query.setString("detalles",emp.getDetalles());
            query.setDate("fecha", emp.getFecha());
            query.setTime("inicio", emp.getInicio());
            query.setTime("fin", emp.getFin());
            int rowCount = query.executeUpdate();
            System.out.println("Rows affected: " + rowCount);
            tx.commit();
            session.close();
            return rowCount;
    }
}
