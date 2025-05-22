from sqlalchemy.orm import Session
from apps.models.dashboard import Dashboard
from apps.models.widget import Widget


def fetch_dashboard(db: Session):
    # Placeholder logic; replace with your actual user-specific widget filtering
    return db.query(Dashboard).all()


def fetch_widget_data(db: Session, widget_id: int):
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if widget:
        widget_data = {
            "query": str(widget.query),
            "chart_type": widget.chart_type,
            "length": widget.length,
            "width": widget.width,
            "only_axis": widget.only_axis if widget.only_axis else "",
            "x_axis": widget.x_axis if widget.x_axis else "",
            "y_axis": widget.y_axis if widget.y_axis else "",
            "parameters": widget.parameters if widget.parameters else [],
            "parameter_query": widget.parameter_query if widget.parameter_query else "",
            "filters_list": widget.filters_list if widget.filters_list else [],

        }
        return widget_data
    return None


def save_dashboard_layout(db: Session, positions: dict):
    dashboard = db.query(Dashboard).first()
    if dashboard:
        updated_positions = {
            **dashboard.positions,
            **positions} if dashboard.positions else positions
        dashboard.positions = updated_positions
    else:
        dashboard = Dashboard(positions=positions)
        db.add(dashboard)
    db.commit()
    db.refresh(dashboard)
    return dashboard
