import React from "react";
import AddMeetingForm from "../components/AddMeetingForm";

function ClubAdminView(props) {
  return (
    <div className="ClubAdminView">
      <h2>Add your next book</h2>
      <AddMeetingForm updateNextMeetingCb={props.updateNextMeetingCb} />
    </div>
  );
}

export default ClubAdminView;
