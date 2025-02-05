import component from "dataClass/componentClass";
import { useEffect } from "react";
import { useDrop } from "react-dnd";
import { connect } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { stateConstantas } from "redux/constantas";
import { store } from "redux/store";
import addComponent from "utils/addComponent";
import antdItem from "../../mock/componentData/antdItem";
import basic from "../../mock/componentData/basic";
import { ElementType } from "../../types/index";
import "./index.css";

function Deploy(props: any) {
  const [params] = useSearchParams();
  var id = params.getAll("id")[0];
  useEffect(() => {
    // 将localstorage的数据render
    var RANDER_COMPONENT: any = localStorage.getItem(id);
    if (RANDER_COMPONENT === "undefined") {
      return;
    }
    var rander_component = JSON.parse(RANDER_COMPONENT);
    // addDom
    if (rander_component == null) {
      return;
    }
    // 0
    for (var i = 0; i < rander_component.length; i++) {
      var obj = JSON.parse(rander_component[i]);
      var type = obj["type"];
      var key = obj["key"];
      var tag = obj["tag"];

      // eslint-disable-next-line no-loop-func
      const dropObj: any = comps.find((value) => {
        return value.type === type;
      });

      if (dropObj.props.children?.length === 1) {
        dropObj.props.children = obj.children;
      }
      if (dropObj.blink === true) {
        dropObj.props.other = obj.other;
      }

      var saveDOM = addComponent(tag, dropObj);
      store.dispatch({
        type: stateConstantas.ADDDOM,
        data: {
          place: key,
          method: stateConstantas.APPENDAFTER,
          newDOM: saveDOM,
        },
      });
      // 遍历obj的children看是否有嵌套
      if (obj.children.length > 1) {
        for (var j = 1; j < obj.children.length; j++) {
          var ctype = obj.children[j]["type"];
          var ckey = obj.children[j]["key"];
          var ctag = obj.children[j]["tag"];
          if (ctype === "option") {
            break;
          }
          // eslint-disable-next-line no-loop-func
          const cdropObj: any = comps.find((value) => {
            return value.type === ctype;
          });

          var csaveDOM = addComponent(ctag, cdropObj);
          store.dispatch({
            type: stateConstantas.ADDDOM,
            data: {
              place: ckey,
              method: stateConstantas.APPENDAFTER,
              newDOM: csaveDOM,
            },
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const basicTypes = basic.map((value) => {
    return value.type;
  });

  const antdTypes = antdItem.map((item) => {
    return item.type;
  });

  const types = [...antdTypes, ...basicTypes];
  const comps = [...basic, ...antdItem];

  var state: component = props.state.stateNode;
  var target: component = props.state.targetDOM;

  const [, drop] = useDrop(() => ({
    // accept: Object.values(leftType), // drop接受的type
    accept: types,
    drop: (_, monitor) => {
      function addComponent(
        parent: component,
        compInfo: ElementType
      ): component {
        var newComp = new component(
          compInfo.type,
          compInfo.props.style || {},
          compInfo.props.event || {},
          [],
          compInfo.blink || false,
          compInfo.props.other || {}
        );
        newComp.parent = parent;

        var children = compInfo.props?.children || undefined;
        if (children && children instanceof Array) {
          children.forEach((item: ElementType | string) => {
            if (typeof item === "string") {
              newComp.children.push(item);
            } else {
              var newDOM = addComponent(newComp, item);
              newComp.children.push(newDOM);
            }
          });
        }
        return newComp;
      }
      const dropObj = comps.find((value) => {
        return value.type === monitor.getItemType();
      });

      console.log(dropObj);
      var optDom = store.getState().StateReducer.mouseMove.optDOM;
      var method = store.getState().StateReducer.mouseMove.method;
      if (optDom) {
        var classes = ["hoverLeft", "hoverRight", "hoverTop", "hoverBottom"];
        optDom.classList = optDom.classList.filter((value: string) => {
          return !classes.includes(value);
        });
        store.dispatch({
          type: "update",
          data: {},
        });
      }
      if (dropObj !== undefined) {
        var newDOM = addComponent(target, dropObj);
        console.log(newDOM);
        if (optDom) {
          store.dispatch({
            type: stateConstantas.INSERT,
            data: {
              method: method,
              newDOM: newDOM,
              optDOM: optDom,
            },
          });
        } else {
          store.dispatch({
            type: stateConstantas.ADDDOM,
            data: {
              place: (target || state).key,
              method: stateConstantas.APPENDAFTER,
              newDOM: newDOM,
            },
          });
        }
      }
    },
  }));

  return (
    <div className="deploy">
      {/* {state.d()} */}
      {state.r()}
    </div>
  );
}
const mapStateToProps = (data: any) => {
  return {
    state: data.StateReducer,
    target: data.targetDOM,
    optLeft: data.optLeft,
  };
};
export default connect(mapStateToProps)(Deploy);
