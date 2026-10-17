import { ChartPieDonutText } from "@/app/components/PieChart";
import { Button } from "@/components/ui/button";
import { Calendar1 } from "lucide-react";
import React from "react";
import { BiDotsVertical, BiTask } from "react-icons/bi";
import { BsPeopleFill } from "react-icons/bs";
import { FaPeopleArrows, FaPeopleGroup } from "react-icons/fa6";

function PatientDashboard() {
  return (
    <div className="container flex flex-col gap-4 pl-1">
      <div>
        <div className="m-2 flex justify-between">
          <div className="flex items-center justify-center gap-2 rounded-lg p-2">
            <Button variant="outline">Yearly</Button>
            <Button variant="outline">Monthly</Button>
            <Button variant="outline">Weekly</Button>
          </div>
          <div className="hover:bg-foreground/20 flex items-center justify-center gap-1 rounded-lg px-1 text-sm">
            Select dates <Calendar1 className="text-sm" />
          </div>
        </div>
        <div className="grid lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-2">
            {/* cards */}
            <div className="bg-muted flex h-auto w-auto justify-between rounded-lg p-2">
              <div className="flex flex-col justify-between">
                <FaPeopleGroup className="text-primary size-6" />
                <p className="text-lg font-bold">1450</p>
                <p className="text-xs">Total Patients</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <BiDotsVertical className="" />
                <p className="text-primary text-xs"> 0.51%+</p>
              </div>
            </div>
            <div className="bg-muted flex h-auto w-auto justify-between rounded-lg p-2">
              <div className="flex flex-col justify-between">
                <FaPeopleArrows className="text-primary size-6" />
                <p className="text-lg font-bold">63</p>
                <p className="text-xs">New Patients</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <BiDotsVertical className="" />
                <p className="text-primary text-xs"> 0.31%+</p>
              </div>
            </div>
            <div className="bg-muted flex h-auto w-auto justify-between rounded-lg p-2">
              <div className="flex flex-col justify-between">
                <BsPeopleFill className="text-primary size-6" />
                <p className="text-lg font-bold">313</p>
                <p className="text-xs">Old Patients</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <BiDotsVertical className="" />
                <p className="text-primary text-xs"> 0.11%+</p>
              </div>
            </div>{" "}
            <div className="bg-muted flex h-auto w-auto justify-between rounded-lg p-2">
              <div className="flex flex-col justify-between">
                <BiTask className="text-primary size-6" />
                <p className="text-lg font-bold">1450</p>
                <p className="text-xs">Total Appointments</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <BiDotsVertical className="" />
                <p className="text-primary text-xs"> 20%+</p>
              </div>
            </div>
          </div>
          <div className="bg-muted mt-2 rounded-lg p-2 lg:mt-0 lg:ml-2">
            {/* patients overviews */}
            <div className="bg-muted flex w-full flex-col rounded-lg">
              <p className="text-primary font-semibold">Patient Overviews</p>
              <div className="flex justify-between gap-3">
                <div className="mt-3 grid min-w-2 grid-cols-1 content-center items-center gap-5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-300" />
                    <p className="text-sm opacity-60">Child 170</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-300" />
                    <p className="text-sm opacity-60">Adult 50</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-300" />
                    <p className="text-sm opacity-60">Teen 90</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-pink-300" />
                    <p className="text-sm opacity-60">Older 45</p>
                  </div>
                </div>
                <div className="">
                  {/* charts */}
                  <ChartPieDonutText />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div> patients</div>
      <div>graphs</div> */}
    </div>
  );
}

export default PatientDashboard;
